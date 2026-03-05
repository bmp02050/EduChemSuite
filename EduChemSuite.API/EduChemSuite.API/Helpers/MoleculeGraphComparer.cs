using System.Text.Json;
using System.Text.Json.Serialization;

namespace EduChemSuite.API.Helpers;

public enum DiagramResult
{
    TopologyWrong,
    AnglesWrong,
    Correct
}

public enum LewisStructureResult
{
    Correct,
    TopologyWrong,
    LonePairsWrong,
    FormalChargesWrong
}

/// <summary>
/// Compares two MoleculeGraph JSON structures for structural equivalence.
/// Uses Weisfeiler-Lehman style iterative label refinement to build canonical
/// signatures, then compares sorted signatures. Ignores atom positions and IDs.
/// </summary>
public static class MoleculeGraphComparer
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private static (MoleculeGraphDto? correct, MoleculeGraphDto? student) DeserializePair(
        string? correctGraphJson, string? studentGraphJson)
    {
        if (string.IsNullOrEmpty(correctGraphJson) || string.IsNullOrEmpty(studentGraphJson))
            return (null, null);

        var correct = JsonSerializer.Deserialize<MoleculeGraphDto>(correctGraphJson, JsonOptions);
        var student = JsonSerializer.Deserialize<MoleculeGraphDto>(studentGraphJson, JsonOptions);
        return (correct, student);
    }

    private static bool ValidateGraphs(MoleculeGraphDto? correct, MoleculeGraphDto? student)
    {
        return correct?.Atoms != null && correct.Bonds != null &&
               student?.Atoms != null && student.Bonds != null;
    }

    public static DiagramResult CheckDiagram(string? correctGraphJson, string? studentGraphJson,
        double? tolerancePercent = null, double toleranceDegrees = 15.0)
    {
        if (string.IsNullOrEmpty(correctGraphJson) || string.IsNullOrEmpty(studentGraphJson))
            return DiagramResult.TopologyWrong;

        try
        {
            var (correct, student) = DeserializePair(correctGraphJson, studentGraphJson);
            if (!ValidateGraphs(correct, student))
                return DiagramResult.TopologyWrong;

            if (!AreEquivalentDto(correct!, student!))
                return DiagramResult.TopologyWrong;

            var mapping = BuildAtomMapping(correct!, student!);
            if (mapping == null) return DiagramResult.TopologyWrong;

            var anglesMatch = tolerancePercent.HasValue
                ? CompareAnglesPercent(correct!, student!, mapping, tolerancePercent.Value)
                : CompareAngles(correct!, student!, mapping, toleranceDegrees);

            return anglesMatch ? DiagramResult.Correct : DiagramResult.AnglesWrong;
        }
        catch
        {
            return DiagramResult.TopologyWrong;
        }
    }

    public static bool AreEquivalent(string? correctGraphJson, string? studentGraphJson)
    {
        if (string.IsNullOrEmpty(correctGraphJson) || string.IsNullOrEmpty(studentGraphJson))
            return false;

        try
        {
            var (correct, student) = DeserializePair(correctGraphJson, studentGraphJson);
            if (!ValidateGraphs(correct, student)) return false;
            return AreEquivalentDto(correct!, student!);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Checks a Lewis dot structure: topology first, then lone pair counts per atom,
    /// then formal charges. Position of lone pairs doesn't matter, only count.
    /// </summary>
    public static LewisStructureResult CheckLewisStructure(
        string? correctGraphJson, string? studentGraphJson)
    {
        if (string.IsNullOrEmpty(correctGraphJson) || string.IsNullOrEmpty(studentGraphJson))
            return LewisStructureResult.TopologyWrong;

        try
        {
            var (correct, student) = DeserializePair(correctGraphJson, studentGraphJson);
            if (!ValidateGraphs(correct, student))
                return LewisStructureResult.TopologyWrong;

            if (!AreEquivalentDto(correct!, student!))
                return LewisStructureResult.TopologyWrong;

            var mapping = BuildAtomMapping(correct!, student!);
            if (mapping == null) return LewisStructureResult.TopologyWrong;

            // Check lone pair counts per mapped atom
            var correctLonePairCounts = correct!.Atoms.ToDictionary(
                a => a.Id, a => a.LonePairs?.Count ?? 0);
            var studentLonePairCounts = student!.Atoms.ToDictionary(
                a => a.Id, a => a.LonePairs?.Count ?? 0);

            foreach (var (correctId, studentId) in mapping)
            {
                if (correctLonePairCounts[correctId] != studentLonePairCounts[studentId])
                    return LewisStructureResult.LonePairsWrong;
            }

            // Check formal charges per mapped atom
            var correctCharges = correct.Atoms.ToDictionary(
                a => a.Id, a => a.FormalCharge ?? 0);
            var studentCharges = student.Atoms.ToDictionary(
                a => a.Id, a => a.FormalCharge ?? 0);

            foreach (var (correctId, studentId) in mapping)
            {
                if (correctCharges[correctId] != studentCharges[studentId])
                    return LewisStructureResult.FormalChargesWrong;
            }

            return LewisStructureResult.Correct;
        }
        catch
        {
            return LewisStructureResult.TopologyWrong;
        }
    }

    private static bool AreEquivalentDto(MoleculeGraphDto correct, MoleculeGraphDto student)
    {
        if (correct.Atoms.Count != student.Atoms.Count) return false;
        if (correct.Bonds.Count != student.Bonds.Count) return false;

        var correctFormula = correct.Atoms.GroupBy(a => a.Element).OrderBy(g => g.Key)
            .Select(g => $"{g.Key}:{g.Count()}");
        var studentFormula = student.Atoms.GroupBy(a => a.Element).OrderBy(g => g.Key)
            .Select(g => $"{g.Key}:{g.Count()}");
        if (!correctFormula.SequenceEqual(studentFormula)) return false;

        var correctSig = GetCanonicalSignature(correct);
        var studentSig = GetCanonicalSignature(student);
        return correctSig.SequenceEqual(studentSig);
    }

    /// <summary>
    /// Checks structural equivalence first, then verifies that bond angles at each atom
    /// match within the given tolerance. This catches cis/trans isomers, tetrahedral vs
    /// planar geometry, and other spatial arrangement differences.
    /// </summary>
    public static bool AreEquivalentStrict(string? correctGraphJson, string? studentGraphJson, double toleranceDegrees = 15.0)
    {
        return CheckDiagram(correctGraphJson, studentGraphJson, toleranceDegrees: toleranceDegrees) == DiagramResult.Correct;
    }

    /// <summary>
    /// Checks structural equivalence first, then verifies that bond angles at each atom
    /// match within a percentage-based tolerance. Each angle's allowed deviation is computed
    /// as a percentage of the correct angle's value.
    /// </summary>
    public static bool AreEquivalentStrictPercent(string? correctGraphJson, string? studentGraphJson, double tolerancePercent)
    {
        return CheckDiagram(correctGraphJson, studentGraphJson, tolerancePercent: tolerancePercent) == DiagramResult.Correct;
    }

    /// <summary>
    /// Maps atoms between two structurally equivalent graphs using WL labels.
    /// Unique labels map directly; tied labels use greedy closest-point matching
    /// after rough alignment.
    /// </summary>
    private static Dictionary<string, string>? BuildAtomMapping(MoleculeGraphDto correct, MoleculeGraphDto student)
    {
        var correctLabels = GetAtomLabels(correct);
        var studentLabels = GetAtomLabels(student);

        // Group atoms by their WL label
        var correctByLabel = correctLabels.GroupBy(kv => kv.Value)
            .ToDictionary(g => g.Key, g => g.Select(kv => kv.Key).ToList());
        var studentByLabel = studentLabels.GroupBy(kv => kv.Value)
            .ToDictionary(g => g.Key, g => g.Select(kv => kv.Key).ToList());

        // Labels must match between the two graphs
        if (correctByLabel.Count != studentByLabel.Count) return null;

        var correctPositions = correct.Atoms.ToDictionary(a => a.Id, a => (a.X, a.Y));
        var studentPositions = student.Atoms.ToDictionary(a => a.Id, a => (a.X, a.Y));

        // Compute centroids for rough alignment
        var (cCx, cCy) = Centroid(correct.Atoms);
        var (sCx, sCy) = Centroid(student.Atoms);

        var mapping = new Dictionary<string, string>();

        foreach (var (label, correctIds) in correctByLabel)
        {
            if (!studentByLabel.TryGetValue(label, out var studentIds)) return null;
            if (correctIds.Count != studentIds.Count) return null;

            if (correctIds.Count == 1)
            {
                // Unique label — direct map
                mapping[correctIds[0]] = studentIds[0];
            }
            else
            {
                // Tied labels — greedy closest-point matching using centroid-aligned positions
                var available = new HashSet<string>(studentIds);
                foreach (var cId in correctIds)
                {
                    var (cx, cy) = correctPositions[cId];
                    var alignedCx = cx - cCx;
                    var alignedCy = cy - cCy;

                    string? bestMatch = null;
                    var bestDist = double.MaxValue;
                    foreach (var sId in available)
                    {
                        var (sx, sy) = studentPositions[sId];
                        var dx = (sx - sCx) - alignedCx;
                        var dy = (sy - sCy) - alignedCy;
                        var dist = dx * dx + dy * dy;
                        if (dist < bestDist)
                        {
                            bestDist = dist;
                            bestMatch = sId;
                        }
                    }

                    if (bestMatch == null) return null;
                    mapping[cId] = bestMatch;
                    available.Remove(bestMatch);
                }
            }
        }

        return mapping;
    }

    /// <summary>
    /// Returns a dictionary of atomId → WL label for atom mapping purposes.
    /// </summary>
    private static Dictionary<string, string> GetAtomLabels(MoleculeGraphDto graph, int rounds = 3)
    {
        var adjacency = BuildAdjacency(graph);
        var labels = graph.Atoms.ToDictionary(a => a.Id, a => a.Element);

        for (var r = 0; r < rounds; r++)
        {
            var newLabels = new Dictionary<string, string>();
            foreach (var atom in graph.Atoms)
            {
                var neighborLabels = adjacency[atom.Id]
                    .Select(n => $"{labels[n.atomId]}:{n.bondType}")
                    .OrderBy(x => x);
                newLabels[atom.Id] = $"{labels[atom.Id]}[{string.Join(",", neighborLabels)}]";
            }
            labels = newLabels;
        }

        return labels;
    }

    /// <summary>
    /// Builds canonical node signatures using iterative neighbor label refinement.
    /// Each round incorporates neighbor labels, making the signature capture
    /// progressively larger local neighborhoods. 3 rounds is sufficient for
    /// typical small molecules (&lt;30 atoms).
    /// </summary>
    private static List<string> GetCanonicalSignature(MoleculeGraphDto graph, int rounds = 3)
    {
        return GetAtomLabels(graph, rounds).Values.OrderBy(x => x).ToList();
    }

    private static Dictionary<string, List<(string atomId, string bondType)>> BuildAdjacency(MoleculeGraphDto graph)
    {
        var adjacency = new Dictionary<string, List<(string atomId, string bondType)>>();
        foreach (var atom in graph.Atoms)
            adjacency[atom.Id] = new List<(string, string)>();

        foreach (var bond in graph.Bonds)
        {
            adjacency[bond.FromAtomId].Add((bond.ToAtomId, bond.Type));
            adjacency[bond.ToAtomId].Add((bond.FromAtomId, bond.Type));
        }

        return adjacency;
    }

    /// <summary>
    /// Compares sorted pairwise bond angles at each mapped atom with 2+ bonds.
    /// Returns false if any angle differs by more than the tolerance.
    /// </summary>
    private static bool CompareAngles(
        MoleculeGraphDto correct, MoleculeGraphDto student,
        Dictionary<string, string> mapping, double toleranceDegrees)
    {
        var correctPositions = correct.Atoms.ToDictionary(a => a.Id, a => (a.X, a.Y));
        var studentPositions = student.Atoms.ToDictionary(a => a.Id, a => (a.X, a.Y));

        var correctAdj = BuildAdjacency(correct);
        var studentAdj = BuildAdjacency(student);

        foreach (var (correctAtomId, studentAtomId) in mapping)
        {
            var correctNeighbors = correctAdj[correctAtomId];
            if (correctNeighbors.Count < 2) continue;

            var correctAngles = GetSortedPairwiseAngles(correctAtomId, correctNeighbors, correctPositions);
            var studentNeighbors = studentAdj[studentAtomId];
            var studentAngles = GetSortedPairwiseAngles(studentAtomId, studentNeighbors, studentPositions);

            if (correctAngles.Count != studentAngles.Count) return false;

            for (var i = 0; i < correctAngles.Count; i++)
            {
                if (Math.Abs(correctAngles[i] - studentAngles[i]) > toleranceDegrees)
                    return false;
            }
        }

        return true;
    }

    /// <summary>
    /// Like CompareAngles but uses a percentage-based tolerance per angle.
    /// The allowed deviation for each angle is correctAngle * (tolerancePercent / 100).
    /// </summary>
    private static bool CompareAnglesPercent(
        MoleculeGraphDto correct, MoleculeGraphDto student,
        Dictionary<string, string> mapping, double tolerancePercent)
    {
        var correctPositions = correct.Atoms.ToDictionary(a => a.Id, a => (a.X, a.Y));
        var studentPositions = student.Atoms.ToDictionary(a => a.Id, a => (a.X, a.Y));

        var correctAdj = BuildAdjacency(correct);
        var studentAdj = BuildAdjacency(student);

        foreach (var (correctAtomId, studentAtomId) in mapping)
        {
            var correctNeighbors = correctAdj[correctAtomId];
            if (correctNeighbors.Count < 2) continue;

            var correctAngles = GetSortedPairwiseAngles(correctAtomId, correctNeighbors, correctPositions);
            var studentNeighbors = studentAdj[studentAtomId];
            var studentAngles = GetSortedPairwiseAngles(studentAtomId, studentNeighbors, studentPositions);

            if (correctAngles.Count != studentAngles.Count) return false;

            for (var i = 0; i < correctAngles.Count; i++)
            {
                var allowedDegrees = correctAngles[i] * (tolerancePercent / 100.0);
                if (Math.Abs(correctAngles[i] - studentAngles[i]) > allowedDegrees)
                    return false;
            }
        }

        return true;
    }

    private static List<double> GetSortedPairwiseAngles(
        string centerAtomId,
        List<(string atomId, string bondType)> neighbors,
        Dictionary<string, (double X, double Y)> positions)
    {
        var center = positions[centerAtomId];
        var angles = new List<double>();

        for (var i = 0; i < neighbors.Count; i++)
        {
            for (var j = i + 1; j < neighbors.Count; j++)
            {
                var a = positions[neighbors[i].atomId];
                var b = positions[neighbors[j].atomId];
                angles.Add(AngleBetween(a, center, b));
            }
        }

        angles.Sort();
        return angles;
    }

    /// <summary>
    /// Computes the angle in degrees at the vertex point between two rays to pointA and pointB.
    /// </summary>
    private static double AngleBetween((double X, double Y) pointA, (double X, double Y) vertex, (double X, double Y) pointB)
    {
        var v1x = pointA.X - vertex.X;
        var v1y = pointA.Y - vertex.Y;
        var v2x = pointB.X - vertex.X;
        var v2y = pointB.Y - vertex.Y;

        var dot = v1x * v2x + v1y * v2y;
        var mag1 = Math.Sqrt(v1x * v1x + v1y * v1y);
        var mag2 = Math.Sqrt(v2x * v2x + v2y * v2y);

        if (mag1 < 1e-10 || mag2 < 1e-10) return 0;

        var cosAngle = Math.Clamp(dot / (mag1 * mag2), -1.0, 1.0);
        return Math.Acos(cosAngle) * (180.0 / Math.PI);
    }

    private static (double X, double Y) Centroid(List<AtomDto> atoms)
    {
        if (atoms.Count == 0) return (0, 0);
        return (atoms.Average(a => a.X), atoms.Average(a => a.Y));
    }
}

public class MoleculeGraphDto
{
    [JsonPropertyName("atoms")]
    public List<AtomDto> Atoms { get; set; } = new();

    [JsonPropertyName("bonds")]
    public List<BondDto> Bonds { get; set; } = new();
}

public class AtomDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";

    [JsonPropertyName("element")]
    public string Element { get; set; } = "";

    [JsonPropertyName("x")]
    public double X { get; set; }

    [JsonPropertyName("y")]
    public double Y { get; set; }

    [JsonPropertyName("charge")]
    public int? Charge { get; set; }

    [JsonPropertyName("lonePairs")]
    public List<LonePairDto>? LonePairs { get; set; }

    [JsonPropertyName("formalCharge")]
    public int? FormalCharge { get; set; }
}

public class LonePairDto
{
    [JsonPropertyName("position")]
    public string Position { get; set; } = "";
}

public class BondDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";

    [JsonPropertyName("fromAtomId")]
    public string FromAtomId { get; set; } = "";

    [JsonPropertyName("toAtomId")]
    public string ToAtomId { get; set; } = "";

    [JsonPropertyName("type")]
    public string Type { get; set; } = "single";
}
