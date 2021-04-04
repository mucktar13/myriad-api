import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  UserCredential,
  People,
} from '../models';
import {UserCredentialRepository} from '../repositories';

export class UserCredentialPeopleController {
  constructor(
    @repository(UserCredentialRepository)
    public userCredentialRepository: UserCredentialRepository,
  ) { }

  @get('/user-credentials/{id}/people', {
    responses: {
      '200': {
        description: 'People belonging to UserCredential',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(People)},
          },
        },
      },
    },
  })
  async getPeople(
    @param.path.string('id') id: typeof UserCredential.prototype.id,
  ): Promise<People> {
    return this.userCredentialRepository.people(id);
  }
}