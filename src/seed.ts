import { connect, connection, disconnect, model, Schema, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import configuration from './config/configuration';
import { Role } from './common/enums/role.enum';
import { AppointmentStatus } from './common/enums/appointment-status.enum';
import { User, UserSchema } from './users/schemas/user.schema';
import { Department, DepartmentSchema } from './departments/schemas/department.schema';
import { Doctor, DoctorSchema } from './doctors/schemas/doctor.schema';
import { Schedule, ScheduleSchema } from './schedules/schemas/schedule.schema';
import { Appointment, AppointmentSchema } from './appointments/schemas/appointment.schema';

const config = configuration();

const UserModel = model<User>('User', UserSchema as Schema<User>);
const DepartmentModel = model<Department>('Department', DepartmentSchema as Schema<Department>);
const DoctorModel = model<Doctor>('Doctor', DoctorSchema as Schema<Doctor>);
const ScheduleModel = model<Schedule>('Schedule', ScheduleSchema as Schema<Schedule>);
const AppointmentModel = model<Appointment>('Appointment', AppointmentSchema as Schema<Appointment>);

async function seed(forceReset = false) {
  await connect(config.mongoUri);
  if (forceReset) {
    await clearDatabase();
  } else {
    await clearCollections();
  }

  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await upsertUser({
    fullName: 'System Admin',
    email: 'admin@smartclinic.local',
    passwordHash,
    role: Role.Admin,
    isActive: true,
    telegramId: null,
    activationToken: null,
  });

  const doctorUser = await upsertUser({
    fullName: 'Dr. Sarah Johnson',
    email: 'doctor@smartclinic.local',
    passwordHash,
    role: Role.Doctor,
    isActive: true,
    telegramId: '123456789',
    activationToken: null,
  });

  const patient = await upsertUser({
    fullName: 'John Patient',
    email: 'patient@smartclinic.local',
    passwordHash,
    role: Role.Patient,
    isActive: true,
    telegramId: '987654321',
    activationToken: null,
  });

  const therapy = await upsertDepartment({
    name: 'Therapy',
    description: 'General medical consultations and first-line care.',
  });

  await upsertDepartment({
    name: 'Cardiology',
    description: 'Heart and cardiovascular consultations.',
  });

  const doctor = await upsertDoctor({
    userId: toObjectId(doctorUser._id),
    departmentId: toObjectId(therapy._id),
    specialization: 'General Practitioner',
    experience: '8 years',
    roomNumber: '12A',
  });

  const scheduleMorning = await upsertSchedule({
    doctorId: toObjectId(doctor._id),
    workDay: 'Monday',
    startTime: '09:00',
    endTime: '13:00',
    isActive: true,
  });

  const scheduleEvening = await upsertSchedule({
    doctorId: toObjectId(doctor._id),
    workDay: 'Wednesday',
    startTime: '14:00',
    endTime: '18:00',
    isActive: true,
  });

  await upsertAppointment({
    patientId: toObjectId(patient._id),
    doctorId: toObjectId(doctor._id),
    scheduleId: toObjectId(scheduleMorning._id),
    appointmentDate: '2026-06-15',
    timeSlot: '09:30-10:00',
    status: AppointmentStatus.Pending,
    notes: 'First visit',
  });

  await upsertAppointment({
    patientId: toObjectId(patient._id),
    doctorId: toObjectId(doctor._id),
    scheduleId: toObjectId(scheduleEvening._id),
    appointmentDate: '2026-06-17',
    timeSlot: '15:00-15:30',
    status: AppointmentStatus.Approved,
    notes: 'Follow-up',
  });

  // eslint-disable-next-line no-console
  console.log('Seed completed');
  // eslint-disable-next-line no-console
  console.log({
    admin: { email: admin.email, password: 'password123' },
    doctor: { email: doctorUser.email, password: 'password123' },
    patient: { email: patient.email, password: 'password123' },
    ids: {
      adminUserId: String(admin._id),
      doctorUserId: String(doctorUser._id),
      doctorProfileId: String(doctor._id),
      therapyDepartmentId: String(therapy._id),
      scheduleMorningId: String(scheduleMorning._id),
      scheduleEveningId: String(scheduleEvening._id),
    },
  });

  await disconnect();
}

async function clearDatabase() {
  await connection.dropDatabase();
}

async function clearCollections() {
  await Promise.all([
    AppointmentModel.deleteMany({}),
    ScheduleModel.deleteMany({}),
    DoctorModel.deleteMany({}),
    DepartmentModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);
}

function toObjectId(value: unknown) {
  if (value instanceof Types.ObjectId) {
    return value;
  }
  return new Types.ObjectId(String(value));
}

async function upsertUser(input: Partial<User> & { email: string }) {
  const existing = await UserModel.findOne({ email: input.email }).exec();
  if (existing) {
    existing.fullName = input.fullName || existing.fullName;
    existing.passwordHash = input.passwordHash || existing.passwordHash;
    existing.role = input.role || existing.role;
    existing.isActive = typeof input.isActive === 'boolean' ? input.isActive : existing.isActive;
    existing.activationToken = input.activationToken ?? existing.activationToken;
    existing.telegramId = input.telegramId ?? existing.telegramId;
    await existing.save();
    return existing;
  }
  return UserModel.create(input);
}

async function upsertDepartment(input: Partial<Department> & { name: string }) {
  const existing = await DepartmentModel.findOne({ name: input.name }).exec();
  if (existing) {
    existing.description = input.description || existing.description;
    await existing.save();
    return existing;
  }
  return DepartmentModel.create(input);
}

async function upsertDoctor(input: Partial<Doctor> & { userId: unknown; departmentId: unknown; specialization: string }) {
  const userId = toObjectId(input.userId);
  const departmentId = toObjectId(input.departmentId);
  const existing = await DoctorModel.findOne({ userId }).exec();
  if (existing) {
    existing.departmentId = departmentId as any;
    existing.specialization = input.specialization;
    existing.experience = input.experience || '';
    existing.roomNumber = input.roomNumber || '';
    await existing.save();
    return existing;
  }
  return DoctorModel.create({
    ...input,
    userId,
    departmentId,
  });
}

async function upsertSchedule(input: Partial<Schedule> & { doctorId: unknown; workDay: string; startTime: string; endTime: string; isActive: boolean }) {
  const doctorId = toObjectId(input.doctorId);
  const existing = await ScheduleModel.findOne({
    doctorId,
    workDay: input.workDay,
    startTime: input.startTime,
    endTime: input.endTime,
  }).exec();
  if (existing) {
    existing.isActive = input.isActive;
    await existing.save();
    return existing;
  }
  return ScheduleModel.create({
    ...input,
    doctorId,
  });
}

async function upsertAppointment(input: Partial<Appointment> & { patientId: unknown; doctorId: unknown; scheduleId: unknown; appointmentDate: string; timeSlot: string; status: AppointmentStatus }) {
  const patientId = toObjectId(input.patientId);
  const doctorId = toObjectId(input.doctorId);
  const scheduleId = toObjectId(input.scheduleId);
  const existing = await AppointmentModel.findOne({
    patientId,
    doctorId,
    scheduleId,
    appointmentDate: input.appointmentDate,
    timeSlot: input.timeSlot,
  }).exec();
  if (existing) {
    existing.status = input.status;
    existing.notes = input.notes || existing.notes;
    await existing.save();
    return existing;
  }
  return AppointmentModel.create({
    ...input,
    patientId,
    doctorId,
    scheduleId,
  });
}

const forceReset = process.argv.includes('--force');

seed(forceReset).catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
