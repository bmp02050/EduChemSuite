using System.Text.Json;

namespace EduChemSuite.API.Helpers;

public enum StoichiometryResult { Correct, StepsWrong, FinalAnswerWrong }

public static class StoichiometryComparer
{
    public static StoichiometryResult Compare(string? correctJson, string? studentJson)
    {
        if (string.IsNullOrEmpty(correctJson) || string.IsNullOrEmpty(studentJson))
            return StoichiometryResult.FinalAnswerWrong;

        try
        {
            var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var correct = JsonSerializer.Deserialize<StoichiometryDto>(correctJson, opts);
            var student = JsonSerializer.Deserialize<StoichiometryDto>(studentJson, opts);

            if (correct?.FinalAnswer == null || student?.FinalAnswer == null)
                return StoichiometryResult.FinalAnswerWrong;

            var tolerance = correct.FinalAnswer.Tolerance > 0
                ? correct.FinalAnswer.Tolerance
                : 0.01;

            // Check final answer within tolerance
            var finalCorrect = Math.Abs(student.FinalAnswer.Value - correct.FinalAnswer.Value) <= tolerance;

            if (!finalCorrect)
                return StoichiometryResult.FinalAnswerWrong;

            // Check steps match
            if (correct.Steps != null && student.Steps != null
                && correct.Steps.Count == student.Steps.Count)
            {
                for (int i = 0; i < correct.Steps.Count; i++)
                {
                    var cs = Normalize(correct.Steps[i].Numerator) + "/" + Normalize(correct.Steps[i].Denominator);
                    var ss = Normalize(student.Steps[i].Numerator) + "/" + Normalize(student.Steps[i].Denominator);
                    if (cs != ss)
                        return StoichiometryResult.StepsWrong;
                }
            }

            return StoichiometryResult.Correct;
        }
        catch
        {
            return StoichiometryResult.FinalAnswerWrong;
        }
    }

    private static string Normalize(string? s) =>
        (s ?? "").Trim().ToLowerInvariant().Replace(" ", "");

    private record StoichiometryDto
    {
        public string ProblemText { get; init; } = "";
        public double GivenValue { get; init; }
        public string GivenUnit { get; init; } = "";
        public List<StepDto> Steps { get; init; } = [];
        public FinalAnswerDto? FinalAnswer { get; init; }
    }

    private record StepDto
    {
        public string Numerator { get; init; } = "";
        public string Denominator { get; init; } = "";
    }

    private record FinalAnswerDto
    {
        public double Value { get; init; }
        public string Unit { get; init; } = "";
        public double Tolerance { get; init; }
    }
}
