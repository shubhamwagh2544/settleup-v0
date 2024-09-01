interface UserSignUpRequest {
    firstName?: string | undefined
    lastName?: string | undefined
    email: string
    password: string
}

interface UserSignInRequest {
    email: string
    password: string
}

export {
    UserSignUpRequest,
    UserSignInRequest
}