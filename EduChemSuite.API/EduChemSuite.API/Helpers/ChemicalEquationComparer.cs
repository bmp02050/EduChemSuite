using System.Text.Json;

namespace EduChemSuite.API.Helpers;

public enum ChemicalEquationResult { Correct, Wrong }

public static class ChemicalEquationComparer
{
    public static ChemicalEquationResult Compare(string? correctJson, string? studentJson)
    {
        if (string.IsNullOrEmpty(correctJson) || string.IsNullOrEmpty(studentJson))
            return ChemicalEquationResult.Wrong;

        try
        {
            var correct = JsonSerializer.Deserialize<EquationDto>(correctJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            var student = JsonSerializer.Deserialize<EquationDto>(studentJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (correct == null || student == null)
                return ChemicalEquationResult.Wrong;

            var correctCoeffs = GetAllCoefficients(correct);
            var studentCoeffs = GetAllCoefficients(student);

            if (correctCoeffs.Count != studentCoeffs.Count || correctCoeffs.Count == 0)
                return ChemicalEquationResult.Wrong;

            // Normalize both to smallest integer ratio
            var normalizedCorrect = Normalize(correctCoeffs);
            var normalizedStudent = Normalize(studentCoeffs);

            for (int i = 0; i < normalizedCorrect.Count; i++)
            {
                if (normalizedCorrect[i] != normalizedStudent[i])
                    return ChemicalEquationResult.Wrong;
            }

            return ChemicalEquationResult.Correct;
        }
        catch
        {
            return ChemicalEquationResult.Wrong;
        }
    }

    private static List<int> GetAllCoefficients(EquationDto eq)
    {
        var coeffs = new List<int>();
        if (eq.Reactants != null) coeffs.AddRange(eq.Reactants.Select(c => c.Coefficient));
        if (eq.Products != null) coeffs.AddRange(eq.Products.Select(c => c.Coefficient));
        return coeffs;
    }

    private static List<int> Normalize(List<int> coeffs)
    {
        if (coeffs.Count == 0) return coeffs;
        var g = coeffs.Aggregate(Gcd);
        return g > 0 ? coeffs.Select(c => c / g).ToList() : coeffs;
    }

    private static int Gcd(int a, int b)
    {
        a = Math.Abs(a); b = Math.Abs(b);
        while (b != 0) { (a, b) = (b, a % b); }
        return a;
    }

    private record EquationDto
    {
        public List<CompoundDto> Reactants { get; init; } = [];
        public List<CompoundDto> Products { get; init; } = [];
    }

    private record CompoundDto
    {
        public string Formula { get; init; } = "";
        public int Coefficient { get; init; } = 1;
    }
}
