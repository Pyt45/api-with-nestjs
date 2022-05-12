import { IsNotEmpty, Length } from 'class-validator'

export default class UpdateUserDto {
    @IsNotEmpty()
    @Length(5, 10)
    displayName: string;

    enableTwoFactorAuth: boolean;
}