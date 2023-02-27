var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
let MovieORM = class MovieORM {
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], MovieORM.prototype, "id", void 0);
__decorate([
    Column("int"),
    __metadata("design:type", Number)
], MovieORM.prototype, "year", void 0);
__decorate([
    Column({ length: 255 }),
    __metadata("design:type", String)
], MovieORM.prototype, "title", void 0);
__decorate([
    Column({ length: 255 }),
    __metadata("design:type", String)
], MovieORM.prototype, "studio", void 0);
__decorate([
    Column({ length: 255 }),
    __metadata("design:type", String)
], MovieORM.prototype, "director", void 0);
MovieORM = __decorate([
    Entity({ name: "movies" })
], MovieORM);
export { MovieORM };
