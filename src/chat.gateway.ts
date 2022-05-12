import { OnModuleInit } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelsService } from './channels/channels.service';
import { ConversationService } from './conversation/conversation.service';
import { ConversationDto } from './conversation/dto/conversation.dto';
import Channel from './entities/channel.entity';
import Message from './entities/message.entity';
import { MessagesService } from './messages/messages.service';

class ChannelType extends Channel {
  public sockets: Socket[];
  public messages: any[];
}

class MessageType extends Message {
  displayName?: string;
  avatar?: string;
  id_message?: number;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
      private messagesService: MessagesService,
      private conversationService: ConversationService
    ) {

  }

  @WebSocketServer()
  private server: Server;

  onModuleInit() {
    // throw new Error('Method not implemented.');
  }

  handleConnection(client: Socket, channel: string) {
    // client.on('channel', function (channel) {
    //   client.join('room');
    // });

    // client.on('leave', function (channel) {
    //   client.leave(channel);
    // })
  }

  @SubscribeMessage('join')
  joinChannel(client: Socket, args: any) {
    client.join(args.id);  
  }

  @SubscribeMessage('leave')
  leaveChannel(client: Socket, args: any) {
    client.leave(args);  
  }

  @SubscribeMessage('new')
  newChannel(client: Socket, args, any) {
    console.log(args);
    // this.messagesService.addMessage()
    this.server.emit('newChannel', args);
  }

  @SubscribeMessage('send')
  async sendMessage(client: Socket, args: any) {
    // return;
    let message: MessageType = await this.messagesService.addMessage(args.user.username, args.id, { message: args.message });
    message.avatar = message.user.avatar;
    message.displayName = message.user.displayName;
    message.id_message = message.id;
    this.server.in(args.id).emit('message', message);
  }

  @SubscribeMessage('owner_leave')
  ownerLeave(client: Socket, args: any) {
    console.log(args);
    this.server.emit('owner_leave', args);
  }

  @SubscribeMessage('ban_user_from_channel')
  bannedUser(client: Socket, args: any) {
    this.server.emit('banned_from_channel', args);
  }

  handleDisconnect(client: any) {
    // throw new Error('Method not implemented.');
  }
  // User Conversation
  @SubscribeMessage('chatWithUser')
  chatWithUser(client: Socket, args: any) {
    client.join(args.id);
  }

  @SubscribeMessage('sendMsg')
  async sendMessageToUser(client: Socket, args: any) {
    const conv: ConversationDto = {
      from: args.user.id,
      to: args.id,
      message: args.message
    };

    let conversation = await this.conversationService.saveConversation(args.user.id, args.id, conv);
    this.server.in(args.user.id).emit('usermessage', args.message);
  }

  @SubscribeMessage('newMsgHere')
  async logMsg(client: Socket, args: any) {
    this.server.emit('newMsgHere', args);
  }

  @SubscribeMessage('block_user')
  blockUser(client: Socket, args: any) {
    this.server.emit('blocked', args);
  }
}
