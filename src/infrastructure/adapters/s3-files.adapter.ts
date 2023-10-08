import { UsersDocument } from "src/features/sa/application/entities/mongoose/users.schema"
import { emailService } from "../services/email.service"
import { Injectable } from "@nestjs/common"
import { join } from "node:path"
import { ensureDirExists } from "../utils/ensure-dir-exists.util"
import { saveFileUtil } from "../utils/save-file.util"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

interface ISaveWallpaperDto {
  blogId: string
  fileName: string
  wallpaperBuffer: Buffer
}

@Injectable()
export class S3FilesAdapter {
  client: S3Client

  constructor() {
    this.client = new S3Client({
    })
  }

  async saveWallpaper({ blogId, fileName, wallpaperBuffer }: ISaveWallpaperDto) {

    const command = new PutObjectCommand({
      Bucket: "nest-proj-bucket",
      Key: "hello-s3.txt",
      Body: "Hello S3!",
    })

    try {
      const response = await this.client.send(command)
      console.log(response)
    } catch (err) {
      console.error(err)
    }


    // const relativeFolderPath = join("blogs", "wallpapers", blogId, fileName)
    // await ensureDirExists(relativeFolderPath)
    // await saveFileUtil(relativeFolderPath, wallpaperBuffer)
  }
}