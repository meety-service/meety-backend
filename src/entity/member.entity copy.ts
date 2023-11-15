import {
    BaseEntity,
    Column,
    Entity,
  } from 'typeorm';
  

@Entity({ name: 'member' })
export class User extends BaseEntity {
  
}