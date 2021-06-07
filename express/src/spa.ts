import express, { Application } from 'express'
import path from 'path'
import process from 'process'

export const serveSPA = (app: Application, pathToSPA: string) => {
    const dir = path.resolve(__dirname, pathToSPA)
    app.use(express.static(dir))
    app.get('*', (req, res) => res.sendFile('index.html', { root: dir }))
}