import React from 'react';
import * as Avatar from '@radix-ui/react-avatar';

interface UserAvatarProps {
    src: string;
    alt: string;
    fallback: string;
    size?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
    src,
    alt,
    fallback,
    size = 45
}) => {
    return (
        <Avatar.Root className="avatar-root" style={{ width: size, height: size }}>
            <Avatar.Image
                className="avatar-image"
                src={src}
                alt={alt}
            />
            <Avatar.Fallback className="avatar-fallback" delayMs={600}>
                {fallback}
            </Avatar.Fallback>
        </Avatar.Root>
    );
}

export const avatarStyles = `
  .avatar-root {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    overflow: hidden;
    user-select: none;
    border-radius: 100%;
    background-color: #f3f4f6;
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }

  .avatar-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e5e7eb;
    color: #6b7280;
    font-size: 15px;
    line-height: 1;
    font-weight: 500;
  }
`; 