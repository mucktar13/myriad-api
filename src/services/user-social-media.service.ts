import {repository} from '@loopback/repository';
import {PlatformType} from '../enums';
import {ExtendedPeople} from '../interfaces';
import {UserSocialMedia} from '../models';
import {PeopleRepository, UserSocialMediaRepository} from '../repositories';
import {PolkadotJs} from '../utils/polkadotJs-utils';
import {injectable, BindingScope, service} from '@loopback/core';
import {NotificationService} from './';
import {HttpErrors} from '@loopback/rest';

@injectable({scope: BindingScope.TRANSIENT})
export class UserSocialMediaService {
  constructor(
    @repository(UserSocialMediaRepository)
    public userSocialMediaRepository: UserSocialMediaRepository,
    @repository(PeopleRepository)
    protected peopleRepository: PeopleRepository,
    @service(NotificationService)
    protected notificationService: NotificationService,
  ) {}

  async createSocialMedia(people: ExtendedPeople): Promise<UserSocialMedia> {
    const {
      name,
      originUserId,
      username,
      platform,
      profilePictureURL,
      publicKey,
    } = people;

    const newUserSocialMedia: Partial<UserSocialMedia> = {
      userId: publicKey,
      platform: platform as PlatformType,
      verified: true,
    };

    let foundPeople = await this.peopleRepository.findOne({
      where: {
        originUserId: originUserId,
        platform: platform,
      },
    });

    if (!foundPeople) {
      foundPeople = await this.peopleRepository.create({
        name,
        username,
        originUserId,
        platform,
        profilePictureURL,
      });

      const {getKeyring, getHexPublicKey} = new PolkadotJs();
      const newKey = getKeyring().addFromUri('//' + foundPeople.id);

      await this.peopleRepository.updateById(foundPeople.id, {
        walletAddress: getHexPublicKey(newKey),
      });
    }

    const userSocialMedia = await this.userSocialMediaRepository.findOne({
      where: {
        peopleId: foundPeople.id,
        platform: platform as PlatformType,
      },
    });

    if (userSocialMedia) {
      if (userSocialMedia.userId !== publicKey) {
        try {
          await this.notificationService.sendDisconnectedSocialMedia(
            userSocialMedia.id,
            publicKey,
          );
        } catch {
          // ignore
        }
        await this.userSocialMediaRepository.deleteById(userSocialMedia.id);
      } else {
        throw new HttpErrors.UnprocessableEntity(
          `You already claimed this ${platform}`,
        );
      }
    }

    const {count} = await this.userSocialMediaRepository.count({
      userId: publicKey,
    });

    if (count === 0) newUserSocialMedia.primary = true;

    return this.peopleRepository
      .userSocialMedia(foundPeople.id)
      .create(newUserSocialMedia);
  }
}
