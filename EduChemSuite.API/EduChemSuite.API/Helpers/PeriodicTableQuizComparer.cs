using System.Text.Json;

namespace EduChemSuite.API.Helpers;

public enum PeriodicTableResult { Correct, PartiallyCorrect, Wrong }

public static class PeriodicTableQuizComparer
{
    public static PeriodicTableResult Compare(string? correctJson, string? studentJson)
    {
        if (string.IsNullOrEmpty(correctJson) || string.IsNullOrEmpty(studentJson))
            return PeriodicTableResult.Wrong;

        try
        {
            var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var quiz = JsonSerializer.Deserialize<QuizDto>(correctJson, opts);
            var response = JsonSerializer.Deserialize<ResponseDto>(studentJson, opts);

            if (quiz == null || response == null)
                return PeriodicTableResult.Wrong;

            return quiz.Mode?.ToLowerInvariant() switch
            {
                "identify" => CompareIdentify(quiz, response),
                "trend" => CompareTrend(quiz, response),
                "classify" => CompareClassify(quiz, response),
                _ => PeriodicTableResult.Wrong
            };
        }
        catch
        {
            return PeriodicTableResult.Wrong;
        }
    }

    private static PeriodicTableResult CompareIdentify(QuizDto quiz, ResponseDto response)
    {
        var config = JsonSerializer.Deserialize<IdentifyConfigDto>(
            quiz.Config.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (config?.CorrectElements == null || response.SelectedElements == null)
            return PeriodicTableResult.Wrong;

        var correct = new HashSet<string>(config.CorrectElements, StringComparer.OrdinalIgnoreCase);
        var student = new HashSet<string>(response.SelectedElements, StringComparer.OrdinalIgnoreCase);

        if (correct.SetEquals(student)) return PeriodicTableResult.Correct;
        if (student.Any(s => correct.Contains(s))) return PeriodicTableResult.PartiallyCorrect;
        return PeriodicTableResult.Wrong;
    }

    private static PeriodicTableResult CompareTrend(QuizDto quiz, ResponseDto response)
    {
        var config = JsonSerializer.Deserialize<TrendConfigDto>(
            quiz.Config.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (config?.CorrectOrder == null || response.OrderedElements == null)
            return PeriodicTableResult.Wrong;

        if (config.CorrectOrder.Count != response.OrderedElements.Count)
            return PeriodicTableResult.Wrong;

        for (int i = 0; i < config.CorrectOrder.Count; i++)
        {
            if (!string.Equals(config.CorrectOrder[i], response.OrderedElements[i],
                StringComparison.OrdinalIgnoreCase))
                return PeriodicTableResult.Wrong;
        }

        return PeriodicTableResult.Correct;
    }

    private static PeriodicTableResult CompareClassify(QuizDto quiz, ResponseDto response)
    {
        var config = JsonSerializer.Deserialize<ClassifyConfigDto>(
            quiz.Config.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (config?.CorrectClassifications == null || response.Classifications == null)
            return PeriodicTableResult.Wrong;

        int correct = 0, total = config.CorrectClassifications.Count;

        foreach (var (element, expected) in config.CorrectClassifications)
        {
            if (response.Classifications.TryGetValue(element, out var actual) &&
                string.Equals(actual, expected, StringComparison.OrdinalIgnoreCase))
                correct++;
        }

        if (correct == total) return PeriodicTableResult.Correct;
        if (correct > 0) return PeriodicTableResult.PartiallyCorrect;
        return PeriodicTableResult.Wrong;
    }

    // DTOs
    private record QuizDto
    {
        public string? Mode { get; init; }
        public JsonElement Config { get; init; }
    }

    private record ResponseDto
    {
        public string? Mode { get; init; }
        public List<string>? SelectedElements { get; init; }
        public List<string>? OrderedElements { get; init; }
        public Dictionary<string, string>? Classifications { get; init; }
    }

    private record IdentifyConfigDto
    {
        public string? Clue { get; init; }
        public List<string>? CorrectElements { get; init; }
    }

    private record TrendConfigDto
    {
        public string? Property { get; init; }
        public List<string>? Elements { get; init; }
        public List<string>? CorrectOrder { get; init; }
    }

    private record ClassifyConfigDto
    {
        public List<string>? Elements { get; init; }
        public Dictionary<string, string>? CorrectClassifications { get; init; }
    }
}
