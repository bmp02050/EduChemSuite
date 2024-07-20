using AutoMapper;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<AccountType, AccountTypeModel>();
            CreateMap<AccountTypeModel, AccountType>();
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
            CreateMap<UserModel, User>();
            CreateMap<School, SchoolModel>();
            CreateMap<SchoolModel, School>();
            CreateMap<District, DistrictModel>();
            CreateMap<DistrictModel, District>();
            CreateMap<UserDistrict, UserDistrictModel>();
            CreateMap<UserDistrictModel, UserDistrict>();
            CreateMap<UserSchool, UserSchoolModel>();
            CreateMap<UserSchoolModel, UserSchool>();
        }
    }
}