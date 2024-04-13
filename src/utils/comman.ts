export const hideEmail = (email: string) => {
  const atIndex = email.indexOf("@");
  if (atIndex > 3) {
    const namePart = email.slice(0, atIndex);
    const maskedName = namePart.slice(0, 3) + "*".repeat(namePart.length - 3);
    return maskedName + email.slice(atIndex);
  } else {
    return email; 
  }
};
