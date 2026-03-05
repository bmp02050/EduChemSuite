import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../environments/environment";
import {SearchQueryModel} from "../_models/SearchQueryModel";
import {PagedResult} from "../_models/PagedResult";
import {ImportResultModel} from "../_models/ImportResultModel";
import {UpsertDistrictModel} from "../_models/UpsertDistrictModel";
import {DistrictModel} from "../_models/DistrictModel";
import {RegisterModel} from "../_models/RegisterModel";
import {UserModel} from "../_models/UserModel";
import {AccountType} from "../_models/AccountType";
import {SchoolModel} from "../_models/SchoolModel";
import {QuestionModel} from "../_models/QuestionModel";
import {QuestionTypeModel} from "../_models/QuestionTypeModel";
import {TagModel} from "../_models/TagModel";
import {AnswerModel} from "../_models/AnswerModel";
import {ExamModel} from "../_models/ExamModel";
import {ExamQuestionModel} from "../_models/ExamQuestionModel";
import {GradeModel} from "../_models/GradeModel";
import {ExamResponseModel} from "../_models/ExamResponseModel";
import {ExamAssignmentModel} from "../_models/ExamAssignmentModel";
import {ImageTypeModel} from "../_models/ImageTypeModel";
import {QuestionTagModel} from "../_models/QuestionTagModel";
import {MolecularStructureModel} from "../_models/MolecularStructureModel";
import {DashboardResponse} from "../_models/DashboardModel";
import {MessageModel} from "../_models/MessageModel";
import {SendMessageModel} from "../_models/SendMessageModel";
import {UserSummaryModel} from "../_models/UserSummaryModel";

@Injectable({providedIn: 'root'})
export class ApiService {
  constructor(
    private router: Router,
    private http: HttpClient
  ) {
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
  };

  // Dashboard endpoint
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${environment.apiUrl}/api/Dashboard`, {withCredentials: true});
  }

  // User endpoints
  getMe(): Observable<UserModel> {
    return this.http.get<UserModel>(`${environment.apiUrl}/api/User/me`, {withCredentials: true});
  }

  getUser(id: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${environment.apiUrl}/api/User/${id}`, {withCredentials: true});
  }

  updateUser(id: string, user: UserModel): Observable<UserModel> {
    return this.http.put<UserModel>(`${environment.apiUrl}/api/User/${id}`, user, {withCredentials: true});
  }

  registerUser(user: RegisterModel): Observable<UserModel> {
    return this.http.post<UserModel>(`${environment.apiUrl}/api/User/register`, user, {withCredentials: true});
  }

  listUsersByDistrict(districtId: string): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${environment.apiUrl}/api/User/district/${districtId}`, {withCredentials: true});
  }

  listUsersBySchool(schoolId: string): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${environment.apiUrl}/api/User/school/${schoolId}`, {withCredentials: true});
  }

  confirmEmail(userId: string, token: string): Observable<string> {
    return this.http.get(`${environment.apiUrl}/api/User/confirm-email`, {
      params: {userId, token},
      responseType: 'text',
      withCredentials: true
    });
  }

  resendRegistrationEmail(userId: string): Observable<string> {
    return this.http.get(`${environment.apiUrl}/api/User/${userId}/token`, {
      responseType: 'text',
      withCredentials: true
    });
  }

  updateAccountType(userId: string, accountType: AccountType): Observable<UserModel> {
    return this.http.patch<UserModel>(
      `${environment.apiUrl}/api/User/${userId}/account-type`,
      { accountType }, {withCredentials: true});
  }

  // District endpoints
  listAllDistricts(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/District`, {withCredentials: true});
  }

  upsertDistrict(newDistrict: UpsertDistrictModel): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/District`, newDistrict, {withCredentials: true});
  }

  // District detail & delete
  getDistrict(id: string): Observable<DistrictModel> {
    return this.http.get<DistrictModel>(`${environment.apiUrl}/api/District/details/${id}`, {withCredentials: true});
  }

  deleteDistrict(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/District/${id}`, {withCredentials: true});
  }

  // School endpoints
  listAllSchools(): Observable<SchoolModel[]> {
    return this.http.get<SchoolModel[]>(`${environment.apiUrl}/api/School`, {withCredentials: true});
  }

  getSchool(id: string): Observable<SchoolModel> {
    return this.http.get<SchoolModel>(`${environment.apiUrl}/api/School/${id}`, {withCredentials: true});
  }

  upsertSchool(school: SchoolModel): Observable<SchoolModel> {
    return this.http.post<SchoolModel>(`${environment.apiUrl}/api/School`, school, {withCredentials: true});
  }

  deleteSchool(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/School/${id}`, {withCredentials: true});
  }

  addSchoolToDistrict(districtId: string, schoolId: string): Observable<DistrictModel> {
    return this.http.post<DistrictModel>(`${environment.apiUrl}/api/District/Schools`, {districtId, schoolId}, {withCredentials: true});
  }

  // User listing
  listAllUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${environment.apiUrl}/api/User/all`, {withCredentials: true});
  }

  // District user assignment
  addUserToDistrict(districtId: string, userId: string): Observable<DistrictModel> {
    return this.http.post<DistrictModel>(`${environment.apiUrl}/api/District/${districtId}/users/${userId}`, {}, {withCredentials: true});
  }

  removeUserFromDistrict(districtId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/District/${districtId}/users/${userId}`, {withCredentials: true});
  }

  // School user assignment
  addUserToSchool(schoolId: string, userId: string): Observable<SchoolModel> {
    return this.http.post<SchoolModel>(`${environment.apiUrl}/api/School/${schoolId}/users/${userId}`, {}, {withCredentials: true});
  }

  removeUserFromSchool(schoolId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/School/${schoolId}/users/${userId}`, {withCredentials: true});
  }

  // Question endpoints
  listQuestionsByUser(userId: string): Observable<QuestionModel[]> {
    return this.http.get<QuestionModel[]>(`${environment.apiUrl}/api/Questions/user/${userId}`, {withCredentials: true});
  }

  listAllQuestions(includeInactive: boolean): Observable<QuestionModel[]> {
    return this.http.get<QuestionModel[]>(`${environment.apiUrl}/api/Questions`, {
      params: {includeInactive: includeInactive.toString()},
      withCredentials: true
    });
  }

  toggleQuestionActive(id: string): Observable<QuestionModel> {
    return this.http.patch<QuestionModel>(`${environment.apiUrl}/api/Questions/${id}/toggle-active`, {}, {withCredentials: true});
  }

  getQuestion(id: string): Observable<QuestionModel> {
    return this.http.get<QuestionModel>(`${environment.apiUrl}/api/Questions/${id}`, {withCredentials: true});
  }

  createQuestion(question: QuestionModel): Observable<QuestionModel> {
    return this.http.post<QuestionModel>(`${environment.apiUrl}/api/Questions`, question, {withCredentials: true});
  }

  updateQuestion(id: string, question: QuestionModel): Observable<QuestionModel> {
    return this.http.put<QuestionModel>(`${environment.apiUrl}/api/Questions/${id}`, question, {withCredentials: true});
  }

  deleteQuestion(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/Questions/${id}`, {withCredentials: true});
  }

  searchQuestionsByTags(tags: string[]): Observable<QuestionModel[]> {
    return this.http.get<QuestionModel[]>(`${environment.apiUrl}/api/Questions/search`, {
      params: {tags: tags.join(',')},
      withCredentials: true
    });
  }

  // Answer endpoints (sub-resource of questions)
  listAnswersByQuestion(questionId: string): Observable<AnswerModel[]> {
    return this.http.get<AnswerModel[]>(`${environment.apiUrl}/api/Questions/${questionId}/answers`, {withCredentials: true});
  }

  createAnswer(questionId: string, answer: AnswerModel): Observable<AnswerModel> {
    return this.http.post<AnswerModel>(`${environment.apiUrl}/api/Questions/${questionId}/answers`, answer, {withCredentials: true});
  }

  updateAnswer(questionId: string, answerId: string, answer: AnswerModel): Observable<AnswerModel> {
    return this.http.put<AnswerModel>(`${environment.apiUrl}/api/Questions/${questionId}/answers/${answerId}`, answer, {withCredentials: true});
  }

  deleteAnswer(questionId: string, answerId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/Questions/${questionId}/answers/${answerId}`, {withCredentials: true});
  }

  // QuestionType endpoints
  listQuestionTypes(): Observable<QuestionTypeModel[]> {
    return this.http.get<QuestionTypeModel[]>(`${environment.apiUrl}/api/QuestionType`, {withCredentials: true});
  }

  createQuestionType(qt: QuestionTypeModel): Observable<QuestionTypeModel> {
    return this.http.post<QuestionTypeModel>(`${environment.apiUrl}/api/QuestionType`, qt, {withCredentials: true});
  }

  updateQuestionType(id: string, qt: QuestionTypeModel): Observable<QuestionTypeModel> {
    return this.http.put<QuestionTypeModel>(`${environment.apiUrl}/api/QuestionType/${id}`, qt, {withCredentials: true});
  }

  // Tag endpoints
  listTags(): Observable<TagModel[]> {
    return this.http.get<TagModel[]>(`${environment.apiUrl}/api/Tag`, {withCredentials: true});
  }

  createTag(tag: TagModel): Observable<TagModel> {
    return this.http.post<TagModel>(`${environment.apiUrl}/api/Tag`, tag, {withCredentials: true});
  }

  updateTag(id: string, tag: TagModel): Observable<TagModel> {
    return this.http.put<TagModel>(`${environment.apiUrl}/api/Tag/${id}`, tag, {withCredentials: true});
  }

  // Exam endpoints
  listExams(): Observable<ExamModel[]> {
    return this.http.get<ExamModel[]>(`${environment.apiUrl}/api/Exam`, {withCredentials: true});
  }

  listAllExams(includeInactive: boolean): Observable<ExamModel[]> {
    return this.http.get<ExamModel[]>(`${environment.apiUrl}/api/Exam`, {
      params: {includeInactive: includeInactive.toString()},
      withCredentials: true
    });
  }

  toggleExamActive(id: string): Observable<ExamModel> {
    return this.http.patch<ExamModel>(`${environment.apiUrl}/api/Exam/${id}/toggle-active`, {}, {withCredentials: true});
  }

  getExam(id: string): Observable<ExamModel> {
    return this.http.get<ExamModel>(`${environment.apiUrl}/api/Exam/${id}`, {withCredentials: true});
  }

  createExam(exam: ExamModel): Observable<ExamModel> {
    return this.http.post<ExamModel>(`${environment.apiUrl}/api/Exam`, exam, {withCredentials: true});
  }

  updateExam(id: string, exam: ExamModel): Observable<ExamModel> {
    return this.http.put<ExamModel>(`${environment.apiUrl}/api/Exam/${id}`, exam, {withCredentials: true});
  }

  deleteExam(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/Exam/${id}`, {withCredentials: true});
  }

  // Exam Assignment endpoints
  listExamAssignments(examId: string): Observable<ExamAssignmentModel[]> {
    return this.http.get<ExamAssignmentModel[]>(`${environment.apiUrl}/api/Exam/${examId}/assignments`, {withCredentials: true});
  }

  assignExamToStudent(examId: string, userId: string): Observable<ExamAssignmentModel> {
    return this.http.post<ExamAssignmentModel>(`${environment.apiUrl}/api/Exam/${examId}/assign/${userId}`, {}, {withCredentials: true});
  }

  unassignExamFromStudent(examId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/Exam/${examId}/assign/${userId}`, {withCredentials: true});
  }

  previewExam(examId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/Exam/${examId}/preview`, {withCredentials: true});
  }

  // Student Exam endpoints
  getStudentExams(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/StudentExam`, {withCredentials: true});
  }

  getStudentExam(examId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/StudentExam/${examId}`, {withCredentials: true});
  }

  saveExamResponse(examId: string, response: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/api/StudentExam/${examId}/response`, response, {withCredentials: true});
  }

  getMyExamResponses(examId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/StudentExam/${examId}/responses`, {withCredentials: true});
  }

  submitExam(examId: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/StudentExam/${examId}/submit`, {}, {withCredentials: true});
  }

  getExamResult(examId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/StudentExam/${examId}/result`, {withCredentials: true});
  }

  // Suggested answers endpoint
  getSuggestedAnswers(questionId: string): Observable<AnswerModel[]> {
    return this.http.get<AnswerModel[]>(`${environment.apiUrl}/api/Questions/${questionId}/suggested-answers`, {withCredentials: true});
  }

  // ExamQuestion endpoints (sub-resource of exam)
  listExamQuestions(examId: string): Observable<ExamQuestionModel[]> {
    return this.http.get<ExamQuestionModel[]>(`${environment.apiUrl}/api/Exam/${examId}/questions`, {withCredentials: true});
  }

  addQuestionToExam(examId: string, eq: ExamQuestionModel): Observable<ExamQuestionModel> {
    return this.http.post<ExamQuestionModel>(`${environment.apiUrl}/api/Exam/${examId}/questions`, eq, {withCredentials: true});
  }

  updateExamQuestion(examId: string, examQuestionId: string, eq: ExamQuestionModel): Observable<ExamQuestionModel> {
    return this.http.put<ExamQuestionModel>(`${environment.apiUrl}/api/Exam/${examId}/questions/${examQuestionId}`, eq, {withCredentials: true});
  }

  removeQuestionFromExam(examId: string, examQuestionId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/Exam/${examId}/questions/${examQuestionId}`, {withCredentials: true});
  }

  // Grade endpoints
  getGrade(id: string): Observable<GradeModel> {
    return this.http.get<GradeModel>(`${environment.apiUrl}/api/Grade/${id}`, {withCredentials: true});
  }

  listGradesByExam(examId: string): Observable<GradeModel[]> {
    return this.http.get<GradeModel[]>(`${environment.apiUrl}/api/Grade/exam/${examId}`, {withCredentials: true});
  }

  listGradesByUser(userId: string): Observable<GradeModel[]> {
    return this.http.get<GradeModel[]>(`${environment.apiUrl}/api/Grade/user/${userId}`, {withCredentials: true});
  }

  createGrade(grade: GradeModel): Observable<GradeModel> {
    return this.http.post<GradeModel>(`${environment.apiUrl}/api/Grade`, grade, {withCredentials: true});
  }

  updateGrade(id: string, grade: GradeModel): Observable<GradeModel> {
    return this.http.put<GradeModel>(`${environment.apiUrl}/api/Grade/${id}`, grade, {withCredentials: true});
  }

  deleteGrade(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/Grade/${id}`, {withCredentials: true});
  }

  // ExamResponse endpoints
  getExamResponse(id: string): Observable<ExamResponseModel> {
    return this.http.get<ExamResponseModel>(`${environment.apiUrl}/api/ExamResponse/${id}`, {withCredentials: true});
  }

  listExamResponsesByUser(userId: string): Observable<ExamResponseModel[]> {
    return this.http.get<ExamResponseModel[]>(`${environment.apiUrl}/api/ExamResponse/user/${userId}`, {withCredentials: true});
  }

  listExamResponsesByExam(examId: string): Observable<ExamResponseModel[]> {
    return this.http.get<ExamResponseModel[]>(`${environment.apiUrl}/api/ExamResponse/exam/${examId}`, {withCredentials: true});
  }

  createExamResponse(examResponse: ExamResponseModel): Observable<ExamResponseModel> {
    return this.http.post<ExamResponseModel>(`${environment.apiUrl}/api/ExamResponse`, examResponse, {withCredentials: true});
  }

  updateExamResponse(id: string, examResponse: ExamResponseModel): Observable<ExamResponseModel> {
    return this.http.put<ExamResponseModel>(`${environment.apiUrl}/api/ExamResponse/${id}`, examResponse, {withCredentials: true});
  }

  deleteExamResponse(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/ExamResponse/${id}`, {withCredentials: true});
  }

  getExamReview(examId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/ExamResponse/exam/${examId}/review`, {withCredentials: true});
  }

  gradeExamResponse(responseId: string, isCorrect: boolean): Observable<ExamResponseModel> {
    return this.http.put<ExamResponseModel>(`${environment.apiUrl}/api/ExamResponse/${responseId}/grade`, {isCorrect}, {withCredentials: true});
  }

  // ImageType endpoints
  listImageTypes(): Observable<ImageTypeModel[]> {
    return this.http.get<ImageTypeModel[]>(`${environment.apiUrl}/api/ImageType`, {withCredentials: true});
  }

  getImageType(id: string): Observable<ImageTypeModel> {
    return this.http.get<ImageTypeModel>(`${environment.apiUrl}/api/ImageType/${id}`, {withCredentials: true});
  }

  createImageType(imageType: ImageTypeModel): Observable<ImageTypeModel> {
    return this.http.post<ImageTypeModel>(`${environment.apiUrl}/api/ImageType`, imageType, {withCredentials: true});
  }

  updateImageType(id: string, imageType: ImageTypeModel): Observable<ImageTypeModel> {
    return this.http.put<ImageTypeModel>(`${environment.apiUrl}/api/ImageType/${id}`, imageType, {withCredentials: true});
  }

  // QuestionTag endpoints (sub-resource of questions)
  listQuestionTags(questionId: string): Observable<QuestionTagModel[]> {
    return this.http.get<QuestionTagModel[]>(`${environment.apiUrl}/api/Questions/${questionId}/tags`, {withCredentials: true});
  }

  addTagToQuestion(questionId: string, questionTag: QuestionTagModel): Observable<QuestionTagModel> {
    return this.http.post<QuestionTagModel>(`${environment.apiUrl}/api/Questions/${questionId}/tags`, questionTag, {withCredentials: true});
  }

  removeTagFromQuestion(questionId: string, questionTagId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/Questions/${questionId}/tags/${questionTagId}`, {withCredentials: true});
  }

  // Email verification
  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/Auth/resend-verification`, {email}, this.httpOptions);
  }

  // Password reset endpoints
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/Auth/forgot-password`, {email}, this.httpOptions);
  }

  resetPassword(userId: string, token: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/Auth/reset-password`, {userId, token, newPassword}, this.httpOptions);
  }

  // Invite permissions
  getInvitePermissions(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/User/invite-permissions`, {withCredentials: true});
  }

  // MolecularStructure endpoints
  listMolecularStructures(): Observable<MolecularStructureModel[]> {
    return this.http.get<MolecularStructureModel[]>(`${environment.apiUrl}/api/MolecularStructure`, {withCredentials: true});
  }

  getMolecularStructure(id: string): Observable<MolecularStructureModel> {
    return this.http.get<MolecularStructureModel>(`${environment.apiUrl}/api/MolecularStructure/${id}`, {withCredentials: true});
  }

  createMolecularStructure(model: MolecularStructureModel): Observable<MolecularStructureModel> {
    return this.http.post<MolecularStructureModel>(`${environment.apiUrl}/api/MolecularStructure`, model, {withCredentials: true});
  }

  updateMolecularStructure(id: string, model: MolecularStructureModel): Observable<MolecularStructureModel> {
    return this.http.put<MolecularStructureModel>(`${environment.apiUrl}/api/MolecularStructure/${id}`, model, {withCredentials: true});
  }

  deleteMolecularStructure(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/MolecularStructure/${id}`, {withCredentials: true});
  }

  // Search endpoints
  private buildSearchParams(query: SearchQueryModel): HttpParams {
    let params = new HttpParams();
    if (query.searchText) params = params.set('searchText', query.searchText);
    if (query.districtId) params = params.set('districtId', query.districtId);
    if (query.schoolId) params = params.set('schoolId', query.schoolId);
    if (query.teacherId) params = params.set('teacherId', query.teacherId);
    if (query.studentId) params = params.set('studentId', query.studentId);
    if (query.examId) params = params.set('examId', query.examId);
    if (query.accountType) params = params.set('accountType', query.accountType);
    if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query.dateTo) params = params.set('dateTo', query.dateTo);
    if (query.gradeMin != null) params = params.set('gradeMin', query.gradeMin.toString());
    if (query.gradeMax != null) params = params.set('gradeMax', query.gradeMax.toString());
    if (query.page) params = params.set('page', query.page.toString());
    if (query.pageSize) params = params.set('pageSize', query.pageSize.toString());
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortDescending) params = params.set('sortDescending', 'true');
    if (query.includeInactive) params = params.set('includeInactive', 'true');
    return params;
  }

  searchUsers(query: SearchQueryModel): Observable<PagedResult<UserModel>> {
    return this.http.get<PagedResult<UserModel>>(`${environment.apiUrl}/api/User/search`, {
      params: this.buildSearchParams(query), withCredentials: true
    });
  }

  searchQuestions(query: SearchQueryModel): Observable<PagedResult<QuestionModel>> {
    return this.http.get<PagedResult<QuestionModel>>(`${environment.apiUrl}/api/Questions/search/advanced`, {
      params: this.buildSearchParams(query), withCredentials: true
    });
  }

  searchExams(query: SearchQueryModel): Observable<PagedResult<ExamModel>> {
    return this.http.get<PagedResult<ExamModel>>(`${environment.apiUrl}/api/Exam/search`, {
      params: this.buildSearchParams(query), withCredentials: true
    });
  }

  searchGrades(query: SearchQueryModel): Observable<PagedResult<GradeModel>> {
    return this.http.get<PagedResult<GradeModel>>(`${environment.apiUrl}/api/Grade/search`, {
      params: this.buildSearchParams(query), withCredentials: true
    });
  }

  searchExamResponses(query: SearchQueryModel): Observable<PagedResult<ExamResponseModel>> {
    return this.http.get<PagedResult<ExamResponseModel>>(`${environment.apiUrl}/api/ExamResponse/search`, {
      params: this.buildSearchParams(query), withCredentials: true
    });
  }

  searchDistricts(query: SearchQueryModel): Observable<PagedResult<DistrictModel>> {
    return this.http.get<PagedResult<DistrictModel>>(`${environment.apiUrl}/api/District/search`, {
      params: this.buildSearchParams(query), withCredentials: true
    });
  }

  searchSchools(query: SearchQueryModel): Observable<PagedResult<SchoolModel>> {
    return this.http.get<PagedResult<SchoolModel>>(`${environment.apiUrl}/api/School/search`, {
      params: this.buildSearchParams(query), withCredentials: true
    });
  }

  // Export endpoints
  exportUsers(query: SearchQueryModel): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/Export/users`, {
      params: this.buildSearchParams(query), responseType: 'blob', withCredentials: true
    });
  }

  exportQuestions(query: SearchQueryModel): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/Export/questions`, {
      params: this.buildSearchParams(query), responseType: 'blob', withCredentials: true
    });
  }

  exportExams(query: SearchQueryModel): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/Export/exams`, {
      params: this.buildSearchParams(query), responseType: 'blob', withCredentials: true
    });
  }

  exportGrades(query: SearchQueryModel): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/Export/grades`, {
      params: this.buildSearchParams(query), responseType: 'blob', withCredentials: true
    });
  }

  exportExamResponses(query: SearchQueryModel): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/Export/exam-responses`, {
      params: this.buildSearchParams(query), responseType: 'blob', withCredentials: true
    });
  }

  exportDistricts(query: SearchQueryModel): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/Export/districts`, {
      params: this.buildSearchParams(query), responseType: 'blob', withCredentials: true
    });
  }

  exportSchools(query: SearchQueryModel): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/Export/schools`, {
      params: this.buildSearchParams(query), responseType: 'blob', withCredentials: true
    });
  }

  // Import endpoints
  importCsv(entityType: string, file: File): Observable<ImportResultModel> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportResultModel>(`${environment.apiUrl}/api/Import/${entityType}`, formData, {withCredentials: true});
  }

  downloadImportTemplate(entityType: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/Import/template/${entityType}`, {
      responseType: 'blob', withCredentials: true
    });
  }

  // Message endpoints
  sendMessage(model: SendMessageModel): Observable<MessageModel[]> {
    return this.http.post<MessageModel[]>(`${environment.apiUrl}/api/Message`, model, {withCredentials: true});
  }

  getInbox(): Observable<MessageModel[]> {
    return this.http.get<MessageModel[]>(`${environment.apiUrl}/api/Message/inbox`, {withCredentials: true});
  }

  getSentMessages(): Observable<MessageModel[]> {
    return this.http.get<MessageModel[]>(`${environment.apiUrl}/api/Message/sent`, {withCredentials: true});
  }

  getConversation(conversationId: string): Observable<MessageModel[]> {
    return this.http.get<MessageModel[]>(`${environment.apiUrl}/api/Message/conversation/${conversationId}`, {withCredentials: true});
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/api/Message/unread-count`, {withCredentials: true});
  }

  markMessageAsRead(messageId: string): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/api/Message/${messageId}/read`, {}, {withCredentials: true});
  }

  markConversationAsRead(conversationId: string): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/api/Message/conversation/${conversationId}/read`, {}, {withCredentials: true});
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/Message/${messageId}`, {withCredentials: true});
  }

  getMessageableUsers(): Observable<UserSummaryModel[]> {
    return this.http.get<UserSummaryModel[]>(`${environment.apiUrl}/api/Message/users`, {withCredentials: true});
  }

  // Contact form
  submitContactForm(model: { name: string; email: string; subjectType: string; message: string; website?: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/Contact`, model);
  }
}
