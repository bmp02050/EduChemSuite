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
            CreateMap<UserModel, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordSalt, opt => opt.Ignore())
                .ForMember(dest => dest.CreateDate, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.VerifiedEmail, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive));
            CreateMap<School, SchoolModel>();
            CreateMap<SchoolModel, School>();
            CreateMap<District, DistrictModel>();
            CreateMap<DistrictModel, District>();
            CreateMap<UpsertDistrictModel, District>();
            CreateMap<UserSchool, UserSchoolModel>();
            CreateMap<UserSchoolModel, UserSchool>();
            CreateMap<NewUserModel, User>();
            CreateMap<DistrictSchools, DistrictSchoolsModel>();
            CreateMap<DistrictSchoolsModel, DistrictSchools>();
            CreateMap<DistrictSchoolsModel, DistrictSchools>();
            CreateMap<UserDistrict, UserDistrictModel>();
            CreateMap<UserDistrictModel, UserDistrict>();
        }
    }
}