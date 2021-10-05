using AltV.Net.Data;
using AltV.Net.Async;
using System;
using System.Collections.Generic;
using System.Linq;

namespace IdentityRP
{
    public class PropManager : iAPI
    {
        public override void OnPlayerIsLoaded(cPlayerInfo player)
        {
            Prop.PropList.ToList().ForEach(prop =>
            {
                AltAsync.EmitAllClients("prop_create_object", prop.Value, prop.Model, prop.Position, prop.Rotation, prop.Dimension, prop.Dynamic, prop.PlaceObjectOnGroundProperly);
            });
        }
    }

    public class Prop
    {
        public static int _ID = 0;
        public static List<Prop> PropList = new List<Prop>();
        private int ID;
        private string model;
        private Position pos;
        private Rotation rot;
        private int dimension;
        internal object Dynamic;

        public bool PlaceObjectOnGroundProperly { get; }

        public Prop(string model, Position pos, Rotation rot, int dimension, bool dynamic = true, bool placeObjectOnGroundProperly = true)
        {
            ID = _ID++;
            Model = model;
            Position = pos;
            Rotation = rot;
            Dimension = dimension;
            Dynamic = dynamic;
            PlaceObjectOnGroundProperly = placeObjectOnGroundProperly;
            Create();
        }

        public void Create()
        {
            lock (Prop.PropList)
            {
                Prop.PropList.Add(this);
            }
            AltAsync.EmitAllClients("prop_create_object", ID, Model, Position, Rotation, Dimension, Dynamic, PlaceObjectOnGroundProperly);
        }

        public void Delete()
        {
            try
            {
                lock (Prop.PropList)
                {
                    Prop.PropList.Remove(this);
                }

                AltAsync.EmitAllClients("prop_delete_object", ID);

                if (this.Deleted == false)
                {
                    this.Deleted = true;
                }
            }
            catch (Exception e)
            {
                Log.Error(e);
            }
        }

        public Prop GetByID(int id)
        {
            return Prop.PropList.ToList().FirstOrDefault(prop => prop.ID == id);
        }

        public Prop GetByProp(Prop prop)
        {
            return Prop.PropList.ToList().FirstOrDefault(_prop => _prop == prop);
        }

        public void SetPosition(Position pos)
        {
            Position = pos;
            AltAsync.EmitAllClients("prop_update_position_object", ID, pos);
        }

        public void SetRotation(Rotation rotation)
        {
            Rotation = rotation;
            AltAsync.EmitAllClients("prop_update_rotation_object", ID, rotation);
        }

        public int Value { get => ID; set => ID = value; }
        public string Model { get => model; set => model = value; }
        public Position Position { get => pos; set => pos = value; }
        public Rotation Rotation { get => rot; set => rot = value; }
        public int Dimension { get => dimension; set => dimension = value; }
        public bool FreezePosition { get; internal set; }
        public bool Deleted { get; private set; }

        internal void MoveEntityPosition(Position vector3)
        {
            AltAsync.EmitAllClients("prop_move_position_object", ID, vector3, 3);
        }
    }
}
