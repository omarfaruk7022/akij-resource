// src/types/index.js
// All application types as JSDoc for JavaScript

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {'employer'|'candidate'} role
 */

/**
 * @typedef {Object} Question
 * @property {string} _id
 * @property {string} title
 * @property {'radio'|'checkbox'|'text'} type
 * @property {string[]} [options]
 * @property {string|string[]} [correctAnswer]
 * @property {number} [marks]
 */

/**
 * @typedef {Object} Exam
 * @property {string} _id
 * @property {string} title
 * @property {number} totalCandidates
 * @property {number} totalSlots
 * @property {number} questionSets
 * @property {'radio'|'checkbox'|'text'|'mixed'} questionType
 * @property {string} startTime
 * @property {string} endTime
 * @property {number} duration - in minutes
 * @property {Question[]} questions
 * @property {boolean} negativeMarking
 * @property {string} createdBy
 * @property {'draft'|'published'|'ended'} status
 */

export const ROLES = {
  EMPLOYER: 'employer',
  CANDIDATE: 'candidate',
};

export const EXAM_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ENDED: 'ended',
};

export const QUESTION_TYPES = {
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  TEXT: 'text',
};
