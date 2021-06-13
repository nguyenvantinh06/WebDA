use DA;
create table Lights (
    id  Int AUTO_INCREMENT UNIQUE PRIMARY KEY,
    Loc REAL NOT NULL,
    Lat REAL NOT NULL,
    activated BOOLEAN NOT NULL DEFAULT TRUE
    );

create table Light_Attributes (
    id              Int AUTO_INCREMENT UNIQUE PRIMARY KEY,
    light_id        INT NOT NULL,
    waiting_time    INT NOT NULL,
    running_time    INT NOT NULL,
    strength        REAL NOT NULL,
    density         REAL NOT NULL,
    manual          BOOLEAN NOT NULL DEFAULT FALSE
);

alter table Light_Attributes
add foreign key (light_id) references Lights(id);

/*Fake data*/
insert into Lights(Loc, Lat) values(10.776432979370345, 106.66355700021649);
insert into Lights(Loc, Lat) values(10.763890083944078, 106.65998308150542);
insert into Lights(Loc, Lat) values(10.770405280458643, 106.65812003320247);

insert into Light_Attributes(light_id, waiting_time, running_time, strength, density, manual)
values (1, 10, 20, 400, 0.2, FALSE);
insert into Light_Attributes(light_id, waiting_time, running_time, strength, density, manual)
values (2, 20, 35, 600, 0.5, FALSE);
insert into Light_Attributes(light_id, waiting_time, running_time, strength, density, manual)
values (3, 30, 50, 1000, 0.8, FALSE);
