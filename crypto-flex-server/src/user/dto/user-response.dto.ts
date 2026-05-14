export class UserResponseDto {
  id: number;
  username?: string;
  real_name?: string;
  avatar?: string;
  bio?: string;
  wallets: string[];
  createdAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.username = user.username;
    this.real_name = user.real_name;
    this.avatar = user.avatar;
    this.bio = user.bio;
    this.wallets = user.wallets?.map((w) => w.wltAdress) || [];
    this.createdAt = user.createdAt;
  }
}
