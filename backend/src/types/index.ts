export type authControllerType = {
    email?: string,
    username?: string,
    password: string
}

export interface IFeedQuery {
    page?: string;
    limit?: string;
}
