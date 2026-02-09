const userRouterEndPoints = {
    userRegister : '/api/user/register',
    userLogin : '/api/user/login',
    userLogout : '/api/user/logout',
    userProfile : '/api/user/profile',

    userCreateTask : '/api/user/task',
    userGetTask : '/api/user/task',
    userBulkTask : '/api/user/bulkTask',
    userGetTaskById : '/api/user/task',
    userUpdateTask : '/api/user/task',

     // Add comment endpoints
    userCreateComment: '/api/user/comments',
    userGetComments: '/api/user/comments/task',
    userGetCommentById: '/api/user/comments',
    userUpdateComment: '/api/user/comments',
    userDeleteComment: '/api/user/comments'
}

export default userRouterEndPoints