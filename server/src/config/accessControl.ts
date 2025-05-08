import { AccessControl } from 'accesscontrol';

// Initialize AccessControl
const ac = new AccessControl();

// Define roles and their permissions
ac.grant('customer')
  // Profile permissions
  .readOwn('profile')
  .updateOwn('profile')

  // Service permissions
  .readAny('service')

  // Booking permissions
  .createOwn('booking')
  .readOwn('booking')
  .updateOwn('booking')
  .deleteOwn('booking')

  // Review permissions
  .createOwn('review')
  .readOwn('review')
  .updateOwn('review')
  .deleteOwn('review')

  // Saved services permissions
  .createOwn('savedService')
  .readOwn('savedService')
  .deleteOwn('savedService')

  // Payment permissions
  .createOwn('payment')
  .readOwn('payment')

  // Wallet permissions
  .readOwn('wallet')
  .updateOwn('wallet')

  // Customer dashboard permissions
  .readOwn('customerDashboard');

ac.grant('provider')
  // Inherit customer permissions
  .extend('customer')

  // Service permissions
  .createOwn('service')
  .updateOwn('service')
  .deleteOwn('service')

  // Booking permissions (as a provider)
  .readOwn('providerBooking')
  .updateOwn('providerBooking')
  .readOwn('booking') // Allow providers to read bookings they're assigned to

  // Wallet permissions
  .readOwn('wallet')
  .updateOwn('wallet')

  // Dashboard permissions
  .readOwn('providerDashboard');

ac.grant('admin')
  // Admin has full access to everything
  .readAny('profile')
  .updateAny('profile')
  .deleteAny('profile')

  .createAny('service')
  .readAny('service')
  .updateAny('service')
  .deleteAny('service')

  .createAny('booking')
  .readAny('booking')
  .updateAny('booking')
  .deleteAny('booking')

  .readAny('review')
  .updateAny('review')
  .deleteAny('review')

  .readAny('savedService')
  .deleteAny('savedService')

  .createAny('payment')
  .readAny('payment')
  .updateAny('payment')

  .readAny('wallet')
  .updateAny('wallet')

  .readAny('providerDashboard')
  .readAny('customerDashboard');

export default ac;
