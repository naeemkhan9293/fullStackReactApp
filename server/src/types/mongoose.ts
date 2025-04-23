import { Document, Types } from 'mongoose';
import { IUser } from '../models/User';
import { IService } from '../models/Service';
import { IBooking } from '../models/Booking';
import { ISavedService } from '../models/SavedService';

// Define populated document types
export type PopulatedUser = Document & IUser;
export type PopulatedService = Document & IService;
export type PopulatedBooking = Document & Omit<IBooking, 'service' | 'provider'> & {
  service: Types.ObjectId | PopulatedService;
  provider: Types.ObjectId | PopulatedUser;
  customer: Types.ObjectId | PopulatedUser;
};

export type PopulatedSavedService = Document & Omit<ISavedService, 'service'> & {
  service: Types.ObjectId | PopulatedService;
};
