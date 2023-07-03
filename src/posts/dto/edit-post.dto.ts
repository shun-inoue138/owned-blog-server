export class EditPostDto {
  title: string;
  content: string;
  image?: Express.Multer.File | undefined;
  isPrivate: boolean;
  user: string;
}
