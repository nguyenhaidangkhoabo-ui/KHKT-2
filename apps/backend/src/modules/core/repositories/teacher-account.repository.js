import { TeacherAccount } from '../entities/teacher-account.entity.js';

export const findByUsername = (username) => TeacherAccount.findOne({ username }).exec();

export const findById = (id) => TeacherAccount.findById(id).exec();

export default { findByUsername, findById };
