export interface Notice {
  id?: number;
  title: string;
  description: string;
  department?: string;
  year?: number;
  postedBy?: string;
  postedDate?: string;
  imagePaths?: string[]; // Base64 image data
  imageFileNames?: string[]; // actual backend filenames
}
