import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    strictObjectIDCoercion: true,
    mongodb: {
      collection: 'experienceUsers',
    },
    indexes: {
      uniqueUserExperienceIndex: {
        keys: {
          userId: 1,
          experienceId: 1,
        },
        options: {
          unique: true,
        },
      },
    },
  },
})
export class ExperienceUser extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {
      dataType: 'ObjectId',
    },
  })
  id?: string;

  @property({
    type: 'string',
    required: false,
  })
  experienceId: string;

  @property({
    type: 'string',
    required: false,
  })
  userId: string;

  constructor(data?: Partial<ExperienceUser>) {
    super(data);
  }
}

export interface ExperienceUserRelations {
  // describe navigational properties here
}

export type ExperienceUserWithRelations = ExperienceUser &
  ExperienceUserRelations;
