enum CommandType {
    EndTurn = 'end_turn',
    Attack = 'attack',
}

export interface CommandModel {
    type: CommandType,
    data: object;
}
