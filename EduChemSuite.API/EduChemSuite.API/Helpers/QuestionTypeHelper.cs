namespace EduChemSuite.API.Helpers;

public static class QuestionTypeHelper
{
    public static bool IsDiagram(string? questionTypeDescription)
    {
        if (string.IsNullOrEmpty(questionTypeDescription)) return false;
        var desc = questionTypeDescription.ToLowerInvariant();
        return desc.Contains("chemical structure") || desc.Contains("diagram") || desc.Contains("molecule");
    }

    public static bool IsAtomicStructure(string? questionTypeDescription)
    {
        if (string.IsNullOrEmpty(questionTypeDescription)) return false;
        var desc = questionTypeDescription.ToLowerInvariant();
        return desc.Contains("atomic structure") || desc.Contains("bohr model");
    }

    public static bool IsChemicalEquation(string? questionTypeDescription)
    {
        if (string.IsNullOrEmpty(questionTypeDescription)) return false;
        var desc = questionTypeDescription.ToLowerInvariant();
        return desc.Contains("chemical equation") || desc.Contains("equation balancing");
    }

    public static bool IsElectronConfig(string? questionTypeDescription)
    {
        if (string.IsNullOrEmpty(questionTypeDescription)) return false;
        var desc = questionTypeDescription.ToLowerInvariant();
        return desc.Contains("electron configuration");
    }

    public static bool IsLewisStructure(string? questionTypeDescription)
    {
        if (string.IsNullOrEmpty(questionTypeDescription)) return false;
        var desc = questionTypeDescription.ToLowerInvariant();
        return desc.Contains("lewis structure") || desc.Contains("lewis dot");
    }

    public static bool IsPeriodicTable(string? questionTypeDescription)
    {
        if (string.IsNullOrEmpty(questionTypeDescription)) return false;
        var desc = questionTypeDescription.ToLowerInvariant();
        return desc.Contains("periodic table");
    }

    public static bool IsStoichiometry(string? questionTypeDescription)
    {
        if (string.IsNullOrEmpty(questionTypeDescription)) return false;
        var desc = questionTypeDescription.ToLowerInvariant();
        return desc.Contains("stoichiometry");
    }

    public static bool IsAutoGradedTool(string? questionTypeDescription)
    {
        return IsDiagram(questionTypeDescription)
            || IsAtomicStructure(questionTypeDescription)
            || IsChemicalEquation(questionTypeDescription)
            || IsElectronConfig(questionTypeDescription)
            || IsLewisStructure(questionTypeDescription)
            || IsPeriodicTable(questionTypeDescription)
            || IsStoichiometry(questionTypeDescription);
    }
}
