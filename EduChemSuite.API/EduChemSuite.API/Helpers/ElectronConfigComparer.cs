using System.Text.Json;

namespace EduChemSuite.API.Helpers;

public enum ElectronConfigResult { Correct, WrongCount, HundsRuleViolation }

public static class ElectronConfigComparer
{
    public static ElectronConfigResult Compare(string? correctJson, string? studentJson)
    {
        if (string.IsNullOrEmpty(correctJson) || string.IsNullOrEmpty(studentJson))
            return ElectronConfigResult.WrongCount;

        try
        {
            var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var correct = JsonSerializer.Deserialize<ElectronConfigDto>(correctJson, opts);
            var student = JsonSerializer.Deserialize<ElectronConfigDto>(studentJson, opts);

            if (correct?.Orbitals == null || student?.Orbitals == null)
                return ElectronConfigResult.WrongCount;

            // Build electron count per orbital for both
            var correctCounts = correct.Orbitals
                .Where(o => TotalElectrons(o) > 0)
                .ToDictionary(o => o.Name, TotalElectrons);
            var studentCounts = student.Orbitals
                .Where(o => TotalElectrons(o) > 0)
                .ToDictionary(o => o.Name, TotalElectrons);

            // Check same orbital set and same electron counts
            if (correctCounts.Count != studentCounts.Count)
                return ElectronConfigResult.WrongCount;

            foreach (var (name, count) in correctCounts)
            {
                if (!studentCounts.TryGetValue(name, out var sc) || sc != count)
                    return ElectronConfigResult.WrongCount;
            }

            // Check Hund's rule: each box should get 1 electron before any gets 2
            foreach (var orbital in student.Orbitals)
            {
                if (orbital.Boxes == null || orbital.Boxes.Count <= 1) continue;
                var hasDouble = orbital.Boxes.Any(b => b.Electrons?.Count >= 2);
                var hasEmpty = orbital.Boxes.Any(b => b.Electrons == null || b.Electrons.Count == 0);
                if (hasDouble && hasEmpty)
                    return ElectronConfigResult.HundsRuleViolation;
            }

            return ElectronConfigResult.Correct;
        }
        catch
        {
            return ElectronConfigResult.WrongCount;
        }
    }

    private static int TotalElectrons(OrbitalDto o) =>
        o.Boxes?.Sum(b => b.Electrons?.Count ?? 0) ?? 0;

    private record ElectronConfigDto
    {
        public string? Element { get; init; }
        public int? AtomicNumber { get; init; }
        public List<OrbitalDto> Orbitals { get; init; } = [];
    }

    private record OrbitalDto
    {
        public string Name { get; init; } = "";
        public string Subshell { get; init; } = "";
        public int N { get; init; }
        public int MaxElectrons { get; init; }
        public int BoxCount { get; init; }
        public List<BoxDto> Boxes { get; init; } = [];
    }

    private record BoxDto
    {
        public List<ElectronDto> Electrons { get; init; } = [];
    }

    private record ElectronDto
    {
        public string Spin { get; init; } = "";
    }
}
