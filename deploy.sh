#!/bin/sh

git pull
pm2 stop pos
pm2 delete pos

pnpm i

pnpm build

pm2 --name pos start pnpm -- start:prod
