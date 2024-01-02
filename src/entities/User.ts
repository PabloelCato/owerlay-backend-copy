import { Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Image } from "./Image.js";

@Entity()
export class User {
  @PrimaryColumn()
  userUuid!: string;

  @OneToMany(() => Image, (image) => image.user)
  images!: Image[];
}
