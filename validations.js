import { body } from 'express-validator'


export const registerValidation = [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('fullName').isLength({ min: 3 }),
    body('avatarUrl').optional().isURL(),
]

export const loginValidation = [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
]

export const postCreateValidation = [
  body("title", "Bad title").isString().isLength({ min: 2 }),
  body("text", "Bad text").isLength({ min: 1 }).isString(),
  body("tags", "Неверный вормат тэгов").optional().isString(),
  body("imageUrl", "Всратая ссылка").optional().isString(),
];

export const commentCreateValidation = [
  body("text", "Введите текст комментария").isLength({ min: 1 }).isString(),
  body("imageUrl", "Всратая ссылка").optional().isString(),
];