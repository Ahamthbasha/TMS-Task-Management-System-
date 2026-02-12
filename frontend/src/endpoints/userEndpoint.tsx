const userRouterEndPoints = {
    userRegister : '/api/user/register',
    userLogin : '/api/user/login',
    userLogout : '/api/user/logout',
    userProfile : '/api/user/profile',
    userSearch : '/api/user/users/search',
    userAll:'/api/user/users/all',

    // Task endpoints - Updated to plural
    userCreateTask : '/api/user/tasks',              
    userGetTasks : '/api/user/tasks',               
    userBulkTask : '/api/user/tasks/bulk',           
    userGetTaskById : '/api/user/tasks',             
    userUpdateTask : '/api/user/tasks',

    // Comment endpoints
    userCreateComment: '/api/user/comments',
    userCreateCommentWithFiles: '/api/user/comments/with-files', // NEW
    userGetComments: '/api/user/comments/task',
    userGetCommentById: '/api/user/comments',
    userUpdateComment: '/api/user/comments',
    userDeleteComment: '/api/user/comments',

    // File endpoints
    userUploadFile: '/api/user/files/upload',
    userGetFile: '/api/user/files',
    userDownloadFile: '/api/user/files',
    userGetTaskFiles: '/api/user/tasks',
    userGetAllTaskFiles: '/api/user/tasks',
    userGetCommentFiles: '/api/user/comments',
    userDeleteFile: '/api/user/files',

     // Analytics endpoints
    analyticsOverview: '/api/user/overview',
    analyticsUserPerformance: '/api/user/userPerformance',
    analyticsTaskTrends: '/api/user/taskTrends',
    analyticsExport: '/api/user/export',
    analyticsExportDownload: '/api/user/export/download',
    analyticsDashboard: '/api/user/dashboard'
}

export default userRouterEndPoints