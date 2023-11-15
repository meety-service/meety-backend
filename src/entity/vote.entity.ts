import {
    BaseEntity,
    Column,
    Entity,
  } from 'typeorm';
  

@Entity({ name: 'vote' })
export class Vote extends BaseEntity {
  
}