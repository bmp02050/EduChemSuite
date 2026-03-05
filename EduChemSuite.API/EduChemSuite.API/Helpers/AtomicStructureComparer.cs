using System.Text.Json;

namespace EduChemSuite.API.Helpers;

public enum AtomicStructureResult { Correct, NucleusWrong, ElectronsWrong }

public static class AtomicStructureComparer
{
    public static AtomicStructureResult Compare(string? correctJson, string? studentJson)
    {
        if (string.IsNullOrEmpty(correctJson) || string.IsNullOrEmpty(studentJson))
            return AtomicStructureResult.NucleusWrong;

        try
        {
            var correct = JsonSerializer.Deserialize<AtomicStructureDto>(correctJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            var student = JsonSerializer.Deserialize<AtomicStructureDto>(studentJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (correct == null || student == null)
                return AtomicStructureResult.NucleusWrong;

            // Check nucleus
            if (correct.Nucleus.Protons != student.Nucleus.Protons ||
                correct.Nucleus.Neutrons != student.Nucleus.Neutrons)
                return AtomicStructureResult.NucleusWrong;

            // Check shells
            if (correct.Shells.Count != student.Shells.Count)
                return AtomicStructureResult.ElectronsWrong;

            for (int i = 0; i < correct.Shells.Count; i++)
            {
                if (correct.Shells[i].Electrons != student.Shells[i].Electrons)
                    return AtomicStructureResult.ElectronsWrong;
            }

            return AtomicStructureResult.Correct;
        }
        catch
        {
            return AtomicStructureResult.NucleusWrong;
        }
    }

    private record AtomicStructureDto
    {
        public NucleusDto Nucleus { get; init; } = new();
        public List<ShellDto> Shells { get; init; } = [];
    }

    private record NucleusDto
    {
        public int Protons { get; init; }
        public int Neutrons { get; init; }
    }

    private record ShellDto
    {
        public int N { get; init; }
        public int Electrons { get; init; }
        public int MaxElectrons { get; init; }
    }
}
