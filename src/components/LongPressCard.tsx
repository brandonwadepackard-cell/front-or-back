import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LongPressContextMenu, ContextMenuItem } from './LongPressContextMenu';

interface LongPressCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  menuItems: ContextMenuItem[];
  className?: string;
}

export const LongPressCard = ({
  title,
  description,
  children,
  menuItems,
  className,
}: LongPressCardProps) => {
  return (
    <LongPressContextMenu menuItems={menuItems} className={className}>
      <Card>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </Card>
    </LongPressContextMenu>
  );
};
