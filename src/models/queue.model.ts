import {Entity, model, property} from '@loopback/repository';

@model()
export class Queue extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'number',
    required: true,
  })
  count: number;


  constructor(data?: Partial<Queue>) {
    super(data);
  }
}

export interface QueueRelations {
  // describe navigational properties here
}

export type QueueWithRelations = Queue & QueueRelations;