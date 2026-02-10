// const userRouterEndPoints = {
//     userRegister : '/api/user/register',
//     userLogin : '/api/user/login',
//     userLogout : '/api/user/logout',
//     userProfile : '/api/user/profile',

//     userCreateTask : '/api/user/task',
//     userGetTask : '/api/user/task',
//     userBulkTask : '/api/user/bulkTask',
//     userGetTaskById : '/api/user/task',
//     userUpdateTask : '/api/user/task',

//      // Add comment endpoints
//     userCreateComment: '/api/user/comments',
//     userGetComments: '/api/user/comments/task',
//     userGetCommentById: '/api/user/comments',
//     userUpdateComment: '/api/user/comments',
//     userDeleteComment: '/api/user/comments',

//     // file endpoints

//     userUploadFile: '/api/user/files/upload',
//     userGetFile: '/api/user/files',
//     userDownloadFile: '/api/user/files',
//     userGetTaskFiles: '/api/user/tasks',
//     userGetAllTaskFiles: '/api/user/tasks',
//     userGetCommentFiles: '/api/user/comments',
//     userDeleteFile: '/api/user/files'
// }

// export default userRouterEndPoints


// endpoints/userEndpoint.ts (Updated)
const userRouterEndPoints = {
    userRegister : '/api/user/register',
    userLogin : '/api/user/login',
    userLogout : '/api/user/logout',
    userProfile : '/api/user/profile',

    // Task endpoints - Updated to plural
    userCreateTask : '/api/user/tasks',              // Changed from '/api/user/task'
    userGetTasks : '/api/user/tasks',                // Changed from '/api/user/task'
    userBulkTask : '/api/user/tasks/bulk',           // Changed from '/api/user/bulkTask'
    userGetTaskById : '/api/user/tasks',             // Changed from '/api/user/task'
    userUpdateTask : '/api/user/tasks',              // Changed from '/api/user/task'

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
    userDeleteFile: '/api/user/files'
}

export default userRouterEndPoints