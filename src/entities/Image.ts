import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User.js";

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  imageURL!: string;

  @Column()
  uuid!: string;

  @Column()
  location!: string;

  @Column()
  description!: string;

  @Column("simple-array")
  tags!: string[];

  @ManyToOne(() => User, (user) => user.images)
  @JoinColumn({ name: "userUuid" })
  user!: User;
}
