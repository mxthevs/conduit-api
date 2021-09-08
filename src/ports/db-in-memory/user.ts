import argon2 from 'argon2'
import { CreateUser, UpdateUser, LoginUser } from '@/core/user/types'
import { v4 as uuidv4 } from 'uuid'
import { DBUser, dbInMemory as db } from './db'

type CreateUserInDB = (data: CreateUser) => Promise<DBUser>

export const createUserInDB: CreateUserInDB = async (data) => {
  if (db.usersByEmail[data.email]) {
    throw new Error('User already registered')
  }

  const hash = await argon2.hash(data.password)

  const id = uuidv4()

  db.usersByEmail[data.email] = id
  db.usersByUsername[data.username] = id

  const user = db.users[id] = {
    id,
    email: data.email,
    username: data.username,
    password: hash,
  }

  return user
}

type UpdateUserInDB = (id: string) => (data: UpdateUser) => Promise<DBUser>

export const updateUserInDB: UpdateUserInDB = (id) => async (data) => {
  const user = db.users[id]

  if (!user) {
    throw new Error('User does not exist')
  }

  if (
    data.email &&
    db.usersByEmail[data.email] &&
    db.usersByEmail[data.email] !== user.id
  ) {
    throw new Error('This email is already in use')
  }

  if (
    data.username &&
    db.usersByUsername[data.username] &&
    db.usersByUsername[data.username] !== user.id
  ) {
    throw new Error('This username is already in use')
  }

  const password = data.password
    ? (await argon2.hash(data.password))
    : user.password

  const email = data.email ?? user.email
  delete db.usersByEmail[user.email]
  db.usersByEmail[email] = id

  const username = data.username ?? user.username
  delete db.usersByUsername[user.username]
  db.usersByUsername[username] = id

  const newUser = db.users[id] = {
    id: user.id,
    email,
    password,
    username,
    bio: data.bio ?? user.bio,
    image: data.image ?? user.image,
  }

  return newUser
}

type Login = (data: LoginUser) => Promise<DBUser>
export const login: Login = async (data) => {
  const userId = db.usersByEmail[data.email]
  const user = db.users[userId ?? '']

  if (!user || !(await argon2.verify(user.password, data.password))) {
    throw new Error('Invalid email or password')
  }

  return user
}

export const getCurrentUserFromDB = async (id: string) => {
  const user = db.users[id]

  if (!user) {
    throw new Error('User does not exist')
  }

  return user
}

export const getProfileFromDB = async (username: string) => {
  const userId = db.usersByUsername[username]
  const user = db.users[userId ?? '']

  if (!user) {
    throw new Error('User does not exist')
  }

  return user
}
