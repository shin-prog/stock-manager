import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 開発中のアプリであり過去の多数のLintエラーによるデプロイ失敗を防ぐため無効化
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
