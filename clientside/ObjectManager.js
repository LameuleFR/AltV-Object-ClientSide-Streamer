import * as alt from 'alt';
import * as extended from 'server-extended';
import * as native from 'natives';
import * as Util from './Util';

var StreamProps = [];
var Props = [];
export default class ObjectManager {
    localPlayer = null;
    constructor(player) {
        this.localPlayer = player;

        alt.onServer('prop_create_object', function (ID, model, pos, rot, dimension, dynamic, placeObjectOnGroundProperly) {
            Prop.Create(ID, model, pos, rot, dimension, dynamic, placeObjectOnGroundProperly);
        });
        alt.onServer('prop_delete_object', function (ID) {
            var prop = Prop.Get(ID);
            if (prop !== undefined) {
                prop.Destroy();
            }
        });
        alt.onServer('prop_update_position_object', function (ID, pos) {
            var prop = Prop.Get(ID);
            if (prop !== undefined) {
                prop.SetPosition(pos);
            }
        });
        alt.onServer('prop_move_position_object', function (ID, pos, speed) {
            var prop = Prop.Get(ID);
            if (prop !== undefined) {
                prop.MovePosition(pos, speed);
            }
        });

        const STREAM_DISTANCE = 250;
        var tick = 0;
        var interval = null;
        interval = alt.setInterval(() => {
            let playerDim = 1; //DEFINE PLAYER DIMENSION HERE
            tick++;
            if (tick % 50 != 0) { return; }
            if (alt.Player.local && alt.Player.local.pos) {
                StreamProps.forEach((prop) => {
                    if (prop) {
                        if (prop.Position && alt.Player.local.pos) {
                            let distance = distanceOf(prop.Position, alt.Player.local.pos);
                            if (distance > STREAM_DISTANCE + 25 || prop.Dimension != playerDim) {
                                prop.Hide();
                            }
                        }
                    }
                });
            }
            if (alt.Player.local && alt.Player.local.pos) {
                Props.forEach((prop) => {
                    if (prop) {
                        if (prop.Position && alt.Player.local.pos && prop.Dimension == playerDim) {
                            let distance = distanceOf(prop.Position, alt.Player.local.pos);
                            if (distance <= STREAM_DISTANCE) {
                                if (!StreamProps.find(p => prop.ID == p.ID)) {
                                    prop.Show();
                                }
                            }
                        }
                    }
                });
            }
        }, 100);
    }
}

export class Prop {
    static Get(id) {
        return Props.find(c => id == c.ID);
    }
    SetPosition(pos) {
        this.Position = pos;
        if (this.Handle) {
            native.setEntityCoords(this.Handle, this.Position.x, this.Position.y, this.Position.z, false, false, false, false);
            this.Position = this.Position;
        }
    }
    MovePosition(pos, speed = 3) {
        this.Position = pos;
        if (this.Handle) {
            //@ts-ignore
            var result = native.slideObject(this.Handle, parseFloat(pos.x), parseFloat(pos.y), parseFloat(pos.z), speed, speed, speed, false);
        }
    }
    Hide() {
        //alt.log("~r~[STREAMER REMOVE] ~w~" + this.ID + ": start stream out: " + this.model);
        StreamProps = StreamProps.filter(c => c.ID != this.ID);
        if (this.Handle && native.doesEntityExist(this.Handle)) {
            native.deleteObject(this.Handle);
            //this.Handle.destroy();
            this.Handle = null;
        }
        //alt.log("~r~[STREAMER REMOVE] ~w~" + this.ID + ": finish stream out: " + this.model);
    }
    Show() {
        //alt.log("~r~[STREAMER] ~w~" + this.ID + ": start stream in: " + this.model);
        if (!this.Handle) {
            //@ts-ignore
            this.Handle = native.createObject(native.getHashKey(this.model), this.Position.x, this.Position.y, this.Position.z, false, false, this.Dynamic);
            native.setEntityRotation(this.Handle, this.Rotation.pitch, this.Rotation.roll, this.Rotation.yaw, 0, false);
            //native.setObjectTargettable(this.Handle, true);
            if (!this.Dynamic) {
                native.freezeEntityPosition(this.Handle, true);
            }
            if (this.PlaceObjectOnGroundProperly) {
                native.placeObjectOnGroundProperly(this.handle);
            }
        }
        StreamProps.push(this);
        //alt.log("~r~[STREAMER] ~w~" + this.ID + ": finish stream in" + this.model);
    }
    static Create(ID, model, pos, rot, dimension, dynamic, placeObjectOnGroundProperly) {
        //alt.log("~r~[STREAMER] ~w~" + ID + ": start create");
        var prop = Prop.Get(ID);
        if (prop !== undefined) {
            prop.destroy();
        }
        prop = new Prop();
        prop.ID = ID;
        prop.Position = pos;
        prop.model = model;
        prop.Rotation = rot;
        prop.Dimension = dimension;
        prop.Dynamic = dynamic;
        prop.PlaceObjectOnGroundProperly = placeObjectOnGroundProperly;
        Props.push(prop);
        //alt.log("~r~[STREAMER] ~w~" + ID + ": finish create");
    }
    Destroy() {
        //alt.log("~r~[STREAMER] ~w~" + this.ID + ": start destroy");
        if (this.Handle) {
            this.Hide();
        }
        Props = Props.filter(c => c != this);
        //alt.log("~r~[STREAMER] ~w~" + this.ID + ": finished destroy");
    }
}
function distanceOf(vec1, vec2) {
    return Math.sqrt(Math.pow((vec1.x - vec2.x), 2) + Math.pow((vec1.y - vec2.y), 2) + Math.pow((vec1.z - vec2.z), 2));
}
