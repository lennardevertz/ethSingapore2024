export const truncateAddress = (address: string, length: number = 6): string => {
    if (!address) return '';
    return `${address.substring(0, length)}...${address.substring(
      address.length - length
    )}`;
  };