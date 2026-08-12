import { StudentAccount } from '../entities/student-account.entity.js';

export const findByUsername = (username) => StudentAccount.findOne({ username }).exec();

export const findById = (id) => StudentAccount.findById(id).exec();

export default { findByUsername, findById };
