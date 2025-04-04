export interface Wards {
    Id: string,
    Name: string,
    Level: string,
}

export interface Districts {
    Id: string,
    Name: string,
    Wards: Wards[],
}

export interface Address {
    Id: string,
    Name: string,
    Districts: Districts[],
}