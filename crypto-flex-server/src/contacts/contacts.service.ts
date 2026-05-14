import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}
  async create(
    createContactDto: CreateContactDto,
    id: number,
    contactId: number,
  ) {
    const contact = await this.prisma.contact.create({
      data: { ...createContactDto, userId: id, contactId: contactId },
    });
    return contact;
  }

  async findAll(userId: number) {
    const contacts = await this.prisma.contact.findMany({
      where: { userId: userId },
    });
    console.log(contacts);
    return contacts;
  }

  async update(id: number, dto: UpdateContactDto) {
    return this.prisma.contact.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.contact.delete({
      where: { id },
    });
  }
}
