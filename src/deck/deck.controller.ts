import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { LoggedUser } from 'src/auth/logged-user.decorator';
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';

@ApiTags('deck')
@UseGuards(AuthGuard())
@ApiBearerAuth()
@Controller('deck')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @ApiOperation({
    summary: 'Create a deck for the logged user',
  })
  @Post()
  create(@Body() dto: CreateDeckDto, @LoggedUser() user: User) {
    return this.deckService.create(dto, user.id);
  }

  @ApiOperation({
    summary: 'Delete the deck of the logged user',
  })
  @Delete(':id')
  delete(@Param('id') id: string, @LoggedUser() user: User) {
    return this.deckService.delete(id, user.id);
  }

  @ApiOperation({
    summary: 'Reset the deck of the logged user',
  })
  @Delete()
  reset(@LoggedUser() user: User) {
    return this.deckService.reset(user.id);
  }
}
