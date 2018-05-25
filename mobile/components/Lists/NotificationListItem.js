// @flow
import * as React from 'react';
import { ListItem } from './ListItem';
import {
  TextColumnContainer,
  TextRowContainer,
  TimestampTextContainer,
  Timestamp,
  Subtitle,
  Link,
  FacepileContainer,
  IconWrapper,
} from './style';
import type { ParsedNotificationType } from '../../views/Notifications/parseNotification';
import type { Navigation } from '../../utils/types';
import { timeDifferenceShort } from '../../../shared/time-difference';
import sentencify from '../../../shared/sentencify';
import Facepile from '../Facepile';
import Icon from '../Icon';

type Props = {
  notification: ParsedNotificationType,
  children?: React.Node,
  currentUserId: string,
  navigation: Navigation,
};

export class NotificationListItem extends React.Component<Props> {
  getActors = () => {
    return this.props.notification.actors.filter(
      actor => actor.id !== this.props.currentUserId
    );
  };

  threadToString = () => {
    const { currentUserId, notification } = this.props;

    const isAuthor = notification.context.payload.creatorId === currentUserId;
    const str = isAuthor ? 'in your thread' : 'in';

    return (
      <React.Fragment>
        <React.Fragment>{str} </React.Fragment>
        <Link>{notification.context.payload.content.title}</Link>
      </React.Fragment>
    );
  };

  messageToString = () => {
    return <Subtitle>your reply</Subtitle>;
  };

  communityToString = () => {
    const { notification } = this.props;
    return <Link>{notification.context.payload.name}</Link>;
  };

  channelToString = () => {
    return <Link>{this.props.notification.context.payload.name}</Link>;
  };

  renderContextString = () => {
    switch (this.props.notification.context.type) {
      case 'SLATE':
      case 'THREAD': {
        return this.threadToString();
      }
      case 'MESSAGE': {
        return this.messageToString();
      }
      case 'COMMUNITY': {
        return this.communityToString();
      }
      case 'CHANNEL': {
        return this.channelToString();
      }
      default: {
        console.error('Invalid notification context type');
        return '';
      }
    }
  };

  renderEventString = () => {
    switch (this.props.notification.event) {
      case 'MESSAGE_CREATED': {
        return <React.Fragment> replied in </React.Fragment>;
      }
      case 'REACTION_CREATED': {
        return <React.Fragment> liked </React.Fragment>;
      }
      case 'CHANNEL_CREATED': {
        return <React.Fragment> created a channel </React.Fragment>;
      }
      case 'USER_JOINED_COMMUNITY': {
        return <React.Fragment> joined </React.Fragment>;
      }
      case 'PRIVATE_CHANNEL_REQUEST_SENT': {
        return <React.Fragment> requested to join </React.Fragment>;
      }
      case 'PRIVATE_CHANNEL_REQUEST_APPROVED': {
        return <React.Fragment> approved your request to join </React.Fragment>;
      }
      case 'PRIVATE_COMMUNITY_REQUEST_SENT': {
        return <React.Fragment> requested to join </React.Fragment>;
      }
      case 'PRIVATE_COMMUNITY_REQUEST_APPROVED': {
        return <React.Fragment> approved your request to join </React.Fragment>;
      }
      case 'MENTION_MESSAGE':
      case 'MENTION_THREAD': {
        return <React.Fragment> mentioned you </React.Fragment>;
      }
      default: {
        return '';
      }
    }
  };

  renderIcon = () => {
    switch (this.props.notification.event) {
      case 'MESSAGE_CREATED': {
        return (
          <Icon
            glyph={'message-fill'}
            size={32}
            color={theme => theme.success.alt}
          />
        );
      }
      case 'REACTION_CREATED': {
        return (
          <Icon glyph={'like-fill'} size={32} color={theme => theme.warn.alt} />
        );
      }
      case 'CHANNEL_CREATED': {
        return (
          <Icon
            glyph={'community'}
            size={32}
            color={theme => theme.brand.alt}
          />
        );
      }
      case 'USER_JOINED_COMMUNITY': {
        return (
          <Icon
            glyph={'member-add'}
            size={32}
            color={theme => theme.space.default}
          />
        );
      }
      case 'PRIVATE_CHANNEL_REQUEST_SENT': {
        return (
          <Icon glyph={'person'} size={32} color={theme => theme.special.alt} />
        );
      }
      case 'PRIVATE_CHANNEL_REQUEST_APPROVED': {
        return (
          <Icon
            glyph={'member-add'}
            size={32}
            color={theme => theme.success.default}
          />
        );
      }
      case 'PRIVATE_COMMUNITY_REQUEST_SENT': {
        return (
          <Icon glyph={'person'} size={32} color={theme => theme.special.alt} />
        );
      }
      case 'PRIVATE_COMMUNITY_REQUEST_APPROVED': {
        return (
          <Icon
            glyph={'member-add'}
            size={32}
            color={theme => theme.success.default}
          />
        );
      }
      case 'MENTION_MESSAGE':
      case 'MENTION_THREAD': {
        return (
          <Icon
            glyph={'mention'}
            size={32}
            color={theme => theme.special.default}
          />
        );
      }
      default: {
        console.warn('unsupported', this.props.notification.event);
        return null;
      }
    }
  };

  getOnPress = (): Function => {
    const { notification, navigation } = this.props;
    let type;
    let id;
    switch (notification.event) {
      case 'MESSAGE_CREATED': {
        type = 'Thread';
        break;
      }
      case 'REACTION_CREATED': {
        type = 'Thread';
        id = notification.context.payload.threadId;
        break;
      }
      case 'CHANNEL_CREATED': {
        type = 'Channel';
        break;
      }
      case 'USER_JOINED_COMMUNITY': {
        type = 'Community';
        break;
      }
      case 'PRIVATE_CHANNEL_REQUEST_SENT': {
        type = 'Channel';
        break;
      }
      case 'PRIVATE_CHANNEL_REQUEST_APPROVED': {
        type = 'Channel';
        break;
      }
      case 'PRIVATE_COMMUNITY_REQUEST_SENT': {
        type = 'Community';
        break;
      }
      case 'PRIVATE_COMMUNITY_REQUEST_APPROVED': {
        type = 'Community';
        break;
      }
      case 'MENTION_THREAD': {
        type = 'Thread';
        break;
      }
      case 'MENTION_MESSAGE': {
        type = 'Thread';
        break;
      }
      default: {
        break;
      }
    }

    if (!type) return () => {};
    return () =>
      navigation.navigate(type, { id: id ? id : notification.context.id });
  };

  facepileDataFromActors = () => {
    return this.props.notification.actors
      .filter(actor => actor.id !== this.props.currentUserId)
      .map(actor => actor.payload);
  };

  renderTimestamp = () => {
    const { notification } = this.props;
    return timeDifferenceShort(
      Date.now(),
      new Date(notification.modifiedAt || notification.createdAt)
    );
  };

  render() {
    return (
      <ListItem onPress={this.getOnPress()}>
        <IconWrapper>{this.renderIcon()}</IconWrapper>

        <TextColumnContainer>
          <TextRowContainer>
            <FacepileContainer>
              <Facepile users={this.facepileDataFromActors()} maxCount={10} />
            </FacepileContainer>

            <TimestampTextContainer>
              <Timestamp type={'body'} light>
                {this.renderTimestamp()}
              </Timestamp>
            </TimestampTextContainer>
          </TextRowContainer>

          <Subtitle numberOfLines={3}>
            {sentencify(
              this.getActors()
                .map(({ payload }) => payload.name)
                .reverse()
            )}
            {this.renderEventString()}
            {this.renderContextString()}
          </Subtitle>
        </TextColumnContainer>
      </ListItem>
    );
  }
}
