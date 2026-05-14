import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post('add/:id')
  @UseGuards(AuthGuard)
  create(
    @Body() createContactDto: CreateContactDto,
    @Request() req,
    @Param('id') contactId: string,
  ) {
    return this.contactsService.create(
      createContactDto,
      req.user.id,
      parseInt(contactId),
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Request() req) {
    return this.contactsService.findAll(req.user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contactsService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.contactsService.remove(+id);
  }
}
