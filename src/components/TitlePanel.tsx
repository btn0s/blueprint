import { Card, Text } from "@radix-ui/themes";

const TitlePanel = () => {
  return (
    <Card className="self-start">
      <Text as="div" size="2" weight="bold">
        Blueprint for Figma
      </Text>
      <Text as="div" size="1" color="gray">
        by @btn0s
      </Text>
    </Card>
  );
};

export default TitlePanel;
