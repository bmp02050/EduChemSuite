using AutoMapper;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<Answer, AnswerModel>();
            CreateMap<AnswerModel, Answer>();
            CreateMap<Exam, ExamModel>();
            CreateMap<ExamModel, Exam>();
            CreateMap<ExamAssignment, ExamAssignmentModel>();
            CreateMap<ExamAssignmentModel, ExamAssignment>();
            CreateMap<ExamQuestion, ExamQuestionModel>();
            CreateMap<ExamQuestionModel, ExamQuestion>();
            CreateMap<ExamResponse, ExamResponseModel>();
            CreateMap<ExamResponseModel, ExamResponse>();
            CreateMap<Grade, GradeModel>();
            CreateMap<GradeModel, Grade>();
            CreateMap<ImageType, ImageTypeModel>();
            CreateMap<ImageTypeModel, ImageType>();
            CreateMap<Question, QuestionModel>();
            CreateMap<QuestionModel, Question>();
            CreateMap<QuestionTag, QuestionTagModel>();
            CreateMap<QuestionTagModel, QuestionTag>();
            CreateMap<QuestionType, QuestionTypeModel>();
            CreateMap<QuestionTypeModel, QuestionType>();
            CreateMap<Tag, TagModel>();
            CreateMap<TagModel, Tag>();
            CreateMap<User, UserModel>();
            CreateMap<User, UserSummaryModel>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src =>
                    src.ShowEmail ? src.Email : null));
            CreateMap<UserModel, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordSalt, opt => opt.Ignore())
                .ForMember(dest => dest.CreateDate, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.VerifiedEmail, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive));
            CreateMap<School, SchoolModel>()
                .ForMember(dest => dest.Staff, opt => opt.MapFrom(src =>
                    src.UserSchools != null
                        ? src.UserSchools
                            .Where(us => us.User != null && (us.User.AccountType == Entities.AccountType.Staff || us.User.AccountType == Entities.AccountType.AdminStaff))
                            .Select(us => us.User)
                        : new List<User>()))
                .ForMember(dest => dest.Students, opt => opt.MapFrom(src =>
                    src.UserSchools != null
                        ? src.UserSchools
                            .Where(us => us.User != null && us.User.AccountType == Entities.AccountType.Student)
                            .Select(us => us.User)
                        : new List<User>()));
            CreateMap<SchoolModel, School>();
            CreateMap<District, DistrictModel>();
            CreateMap<DistrictModel, District>();
            CreateMap<UpsertDistrictModel, District>();
            CreateMap<UserSchool, UserSchoolModel>();
            CreateMap<UserSchoolModel, UserSchool>();
            CreateMap<NewUserModel, User>();
            CreateMap<DistrictSchools, DistrictSchoolsModel>();
            CreateMap<DistrictSchoolsModel, DistrictSchools>();
            CreateMap<UserDistrict, UserDistrictModel>();
            CreateMap<UserDistrictModel, UserDistrict>();
            CreateMap<MolecularStructure, MolecularStructureModel>();
            CreateMap<MolecularStructureModel, MolecularStructure>();
            CreateMap<Message, MessageModel>()
                .ForMember(dest => dest.SenderName, opt => opt.MapFrom(src =>
                    src.Sender != null ? src.Sender.FirstName + " " + src.Sender.LastName : null))
                .ForMember(dest => dest.SenderAccountType, opt => opt.MapFrom(src =>
                    src.Sender != null ? src.Sender.AccountType.ToString() : null))
                .ForMember(dest => dest.RecipientName, opt => opt.MapFrom(src =>
                    src.Recipient != null ? src.Recipient.FirstName + " " + src.Recipient.LastName : null))
                .ForMember(dest => dest.RecipientAccountType, opt => opt.MapFrom(src =>
                    src.Recipient != null ? src.Recipient.AccountType.ToString() : null));
            CreateMap<MessageModel, Message>();
        }
    }
}